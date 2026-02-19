import { type Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  getAuthContext,
  isRecord,
  isUuid,
  mapUserToDetailApi,
  normalizeTime,
  parsePermissionsPayload,
  parseStoredArray,
  pickBoolean,
  pickDefined,
  pickNumber,
  pickString,
  stringifyArray,
  toJsonArray,
  toStoredStatus,
} from '@/lib/server/users-roles';

export const runtime = 'nodejs';

const PASSWORD_SALT_ROUNDS = 10;
const GLOBAL_USER_EMAIL_LIMIT = 100;
const GLOBAL_USER_NAME_LIMIT = 100;
const GLOBAL_EMAIL_EXISTS_ERROR = 'GLOBAL_EMAIL_EXISTS';

const normalizeGlobalUserName = (name: string): string =>
  name.length <= GLOBAL_USER_NAME_LIMIT ? name : name.slice(0, GLOBAL_USER_NAME_LIMIT);

const syncGlobalUserForUpdate = async (
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    email: string;
    name: string;
    roleId: string | null;
    status: string;
    password?: string;
  }
): Promise<void> => {
  const { userId, email, name, roleId, status, password } = params;
  const normalizedName = normalizeGlobalUserName(name);
  const passwordHash = password ? await hash(password, PASSWORD_SALT_ROUNDS) : null;

  const duplicateEmailRows = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT TOP (1) [id]
    FROM [dbo].[users]
    WHERE [email] = ${email}
      AND [id] <> ${userId}
  `;

  if (duplicateEmailRows.length > 0) {
    throw new Error(GLOBAL_EMAIL_EXISTS_ERROR);
  }

  const currentUserRows = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT TOP (1) [id]
    FROM [dbo].[users]
    WHERE [id] = ${userId}
  `;

  if (currentUserRows.length === 0) {
    await tx.$executeRaw`
      INSERT INTO [dbo].[users]
        ([id], [email], [password_hash], [first_name], [is_email_verified], [status], [provider], [created_at], [updated_at], [role_id])
      VALUES
        (${userId}, ${email}, ${passwordHash}, ${normalizedName}, ${passwordHash ? 1 : 0}, ${status}, ${'local'}, SYSUTCDATETIME(), SYSUTCDATETIME(), ${roleId})
    `;
    return;
  }

  if (passwordHash) {
    await tx.$executeRaw`
      UPDATE [dbo].[users]
      SET
        [email] = ${email},
        [first_name] = ${normalizedName},
        [status] = ${status},
        [role_id] = ${roleId},
        [password_hash] = ${passwordHash},
        [provider] = COALESCE([provider], ${'local'}),
        [updated_at] = SYSUTCDATETIME()
      WHERE [id] = ${userId}
    `;
  } else {
    await tx.$executeRaw`
      UPDATE [dbo].[users]
      SET
        [email] = ${email},
        [first_name] = ${normalizedName},
        [status] = ${status},
        [role_id] = ${roleId},
        [provider] = COALESCE([provider], ${'local'}),
        [updated_at] = SYSUTCDATETIME()
      WHERE [id] = ${userId}
    `;
  }
};

type RouteContext = {
  params: Promise<{ userId: string }>;
};

const findUserByIdentifier = async (organizationId: string, userId: string) => {
  const byUserId = await prisma.organizationUser.findFirst({
    where: {
      organizationId,
      userId,
    },
    include: {
      role: {
        select: {
          name: true,
          permissionsJson: true,
        },
      },
    },
  });

  if (byUserId) {
    return byUserId;
  }

  return prisma.organizationUser.findFirst({
    where: {
      organizationId,
      id: userId,
    },
    include: {
      role: {
        select: {
          name: true,
          permissionsJson: true,
        },
      },
    },
  });
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const { organizationId } = getAuthContext(request);

    const user = await findUserByIdentifier(organizationId, userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      data: mapUserToDetailApi(user),
    });
  } catch (error) {
    console.error('GET /api/users/[userId] failed', error);
    return NextResponse.json({ message: 'Failed to fetch user.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const rawBody: unknown = await request.json().catch(() => ({}));
    const body = isRecord(rawBody) ? rawBody : {};
    const { organizationId } = getAuthContext(request);

    const existingUser = await findUserByIdentifier(organizationId, userId);
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const hasName = pickDefined(body, ['name', 'Name']) !== undefined;
    const nextName = hasName ? pickString(body, 'name', 'Name') : existingUser.name;
    if (!nextName) {
      return NextResponse.json({ message: 'User name is required.' }, { status: 400 });
    }

    const hasEmail = pickDefined(body, ['email', 'Email']) !== undefined;
    const emailCandidate = hasEmail ? pickString(body, 'email', 'Email') : existingUser.email;
    const nextEmail = emailCandidate?.toLowerCase();
    if (!nextEmail) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }
    if (nextEmail.length > GLOBAL_USER_EMAIL_LIMIT) {
      return NextResponse.json(
        { message: `Email must be ${GLOBAL_USER_EMAIL_LIMIT} characters or fewer.` },
        { status: 400 }
      );
    }

    if (nextEmail !== existingUser.email) {
      const duplicate = await prisma.organizationUser.findFirst({
        where: {
          organizationId,
          email: nextEmail,
          id: { not: existingUser.id },
        },
      });

      if (duplicate) {
        return NextResponse.json({ status: 'exists', message: 'Email already exists for this tenant.' }, { status: 200 });
      }
    }

    const roleIdRaw = pickDefined(body, ['roleid', 'roleId', 'RoleId', 'role_id']);
    let nextRoleId = existingUser.roleId;

    if (roleIdRaw !== undefined) {
      const roleId = typeof roleIdRaw === 'string' && roleIdRaw.trim() ? roleIdRaw.trim() : null;
      if (roleId && !isUuid(roleId)) {
        return NextResponse.json({ message: 'Invalid role id format.' }, { status: 400 });
      }

      if (roleId) {
        const role = await prisma.role.findFirst({
          where: { organizationId, id: roleId },
        });
        if (!role) {
          return NextResponse.json({ message: 'Selected role does not exist.' }, { status: 404 });
        }
      }

      nextRoleId = roleId;
    }

    const currentAllow = parseStoredArray(existingUser.permissionsAllowJson);
    const currentDeny = parseStoredArray(existingUser.permissionsDenyJson);

    const permissionsRaw = pickDefined(body, ['permissions', 'Permissions']);
    const parsedPermissions = parsePermissionsPayload(permissionsRaw, {
      allow: currentAllow,
      deny: currentDeny,
    });

    const allowOverride = pickDefined(body, ['permissionsAllow', 'permissions_allow']);
    const denyOverride = pickDefined(body, ['permissionsDeny', 'permissions_deny']);
    const allowPermissions = allowOverride === undefined ? parsedPermissions.allow : toJsonArray(allowOverride);
    const denyPermissions = denyOverride === undefined ? parsedPermissions.deny : toJsonArray(denyOverride);

    const branchesRaw = pickDefined(body, ['Branches', 'branches']);
    const branches = branchesRaw === undefined ? parseStoredArray(existingUser.branchesJson) : toJsonArray(branchesRaw);

    const backDaysLimit = pickNumber(body, 'BackDaysLimit', 'backDaysLimit') ?? existingUser.backDaysLimit;
    const timeRestrictionEnabled =
      pickBoolean(body, 'TimeRestrictionEnabled', 'timeRestrictionEnabled') ??
      existingUser.timeRestrictionEnabled;

    const timeFromRaw = pickDefined(body, ['TimeFrom', 'timeFrom']);
    const timeFrom = timeFromRaw === undefined ? existingUser.timeFrom : normalizeTime(timeFromRaw);

    const timeToRaw = pickDefined(body, ['TimeTo', 'timeTo']);
    const timeTo = timeToRaw === undefined ? existingUser.timeTo : normalizeTime(timeToRaw);

    const offDayRaw = pickDefined(body, ['OffDay', 'offDay']);
    const offDay = offDayRaw === undefined ? existingUser.offDay : pickString(body, 'OffDay', 'offDay') ?? null;

    const statusRaw = pickDefined(body, ['status', 'Status']);
    const status = statusRaw === undefined ? existingUser.status : toStoredStatus(statusRaw, existingUser.status);
    const password = pickString(body, 'password', 'Password');

    const updatedUser = await prisma.$transaction(async (tx) => {
      await syncGlobalUserForUpdate(tx, {
        userId: existingUser.userId,
        email: nextEmail,
        name: nextName,
        roleId: nextRoleId,
        status,
        password,
      });

      return tx.organizationUser.update({
        where: { id: existingUser.id },
        data: {
          name: nextName,
          email: nextEmail,
          roleId: nextRoleId,
          status,
          permissionsAllowJson: stringifyArray(allowPermissions),
          permissionsDenyJson: stringifyArray(denyPermissions),
          branchesJson: stringifyArray(branches),
          backDaysLimit,
          timeRestrictionEnabled,
          timeFrom: timeRestrictionEnabled ? timeFrom : null,
          timeTo: timeRestrictionEnabled ? timeTo : null,
          offDay,
        },
        include: {
          role: {
            select: {
              name: true,
              permissionsJson: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      status: 'success',
      message: 'User updated successfully.',
      userId: updatedUser.userId,
      data: {
        userId: updatedUser.userId,
        organizationUserId: updatedUser.id,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === GLOBAL_EMAIL_EXISTS_ERROR) {
      return NextResponse.json(
        { status: 'exists', message: 'Email already exists for another user account.' },
        { status: 200 }
      );
    }

    console.error('PUT /api/users/[userId] failed', error);
    return NextResponse.json({ message: 'Failed to update user.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const { organizationId } = getAuthContext(request);

    const existingUser = await findUserByIdentifier(organizationId, userId);
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    await prisma.organizationUser.delete({
      where: { id: existingUser.id },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    console.error('DELETE /api/users/[userId] failed', error);
    return NextResponse.json({ message: 'Failed to delete user.' }, { status: 500 });
  }
}
