import { type Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  getAuthContext,
  isRecord,
  isUuid,
  mapUserToListApi,
  normalizeTime,
  parsePermissionsPayload,
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

const normalizeGlobalUserName = (name: string): string =>
  name.length <= GLOBAL_USER_NAME_LIMIT ? name : name.slice(0, GLOBAL_USER_NAME_LIMIT);

const upsertGlobalUserForCreate = async (
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    email: string;
    name: string;
    roleId: string | null;
    status: string;
    password?: string;
  }
): Promise<string> => {
  const { userId, email, name, roleId, status, password } = params;
  const normalizedName = normalizeGlobalUserName(name);
  const passwordHash = password ? await hash(password, PASSWORD_SALT_ROUNDS) : null;

  const existingUsers = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT TOP (1) [id]
    FROM [dbo].[users]
    WHERE [email] = ${email}
  `;

  if (existingUsers.length > 0) {
    const existingUserId = existingUsers[0].id;

    if (passwordHash) {
      await tx.$executeRaw`
        UPDATE [dbo].[users]
        SET
          [first_name] = ${normalizedName},
          [status] = ${status},
          [role_id] = ${roleId},
          [password_hash] = ${passwordHash},
          [provider] = COALESCE([provider], ${'local'}),
          [updated_at] = SYSUTCDATETIME()
        WHERE [id] = ${existingUserId}
      `;
    } else {
      await tx.$executeRaw`
        UPDATE [dbo].[users]
        SET
          [first_name] = ${normalizedName},
          [status] = ${status},
          [role_id] = ${roleId},
          [provider] = COALESCE([provider], ${'local'}),
          [updated_at] = SYSUTCDATETIME()
        WHERE [id] = ${existingUserId}
      `;
    }

    return existingUserId;
  }

  await tx.$executeRaw`
    INSERT INTO [dbo].[users]
      ([id], [email], [password_hash], [first_name], [is_email_verified], [status], [provider], [created_at], [updated_at], [role_id])
    VALUES
      (${userId}, ${email}, ${passwordHash}, ${normalizedName}, ${passwordHash ? 1 : 0}, ${status}, ${'local'}, SYSUTCDATETIME(), SYSUTCDATETIME(), ${roleId})
  `;

  return userId;
};

export async function GET(request: NextRequest) {
  try {
    const { organizationId } = getAuthContext(request);

    const users = await prisma.organizationUser.findMany({
      where: { organizationId },
      include: {
        role: {
          select: {
            name: true,
            permissionsJson: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users.map(mapUserToListApi));
  } catch (error) {
    console.error('GET /api/users failed', error);
    return NextResponse.json({ message: 'Failed to fetch users.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json().catch(() => ({}));
    const body = isRecord(rawBody) ? rawBody : {};
    const { organizationId, actorUserId } = getAuthContext(request);

    const name = pickString(body, 'name', 'Name');
    const email = pickString(body, 'email', 'Email')?.toLowerCase();
    const password = pickString(body, 'password', 'Password');
    const roleId = pickString(body, 'roleid', 'roleId', 'RoleId', 'role_id');

    if (!name) {
      return NextResponse.json({ message: 'User name is required.' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }
    if (email.length > GLOBAL_USER_EMAIL_LIMIT) {
      return NextResponse.json(
        { message: `Email must be ${GLOBAL_USER_EMAIL_LIMIT} characters or fewer.` },
        { status: 400 }
      );
    }

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

    const existingUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId,
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: 'exists',
          message: 'Email already exists for this tenant.',
          userId: existingUser.userId,
          data: {
            userId: existingUser.userId,
            organizationUserId: existingUser.id,
          },
        },
        { status: 200 }
      );
    }

    const permissionsRaw = pickDefined(body, ['permissions', 'Permissions']);
    const permissions = parsePermissionsPayload(permissionsRaw, { allow: [], deny: [] });

    const allowOverride = pickDefined(body, ['permissionsAllow', 'permissions_allow']);
    const denyOverride = pickDefined(body, ['permissionsDeny', 'permissions_deny']);
    const allowPermissions = allowOverride === undefined ? permissions.allow : toJsonArray(allowOverride);
    const denyPermissions = denyOverride === undefined ? permissions.deny : toJsonArray(denyOverride);

    const branchesRaw = pickDefined(body, ['Branches', 'branches']);
    const branches = branchesRaw === undefined ? [] : toJsonArray(branchesRaw);

    const backDaysLimit = pickNumber(body, 'BackDaysLimit', 'backDaysLimit') ?? 0;
    const timeRestrictionEnabled =
      pickBoolean(body, 'TimeRestrictionEnabled', 'timeRestrictionEnabled') ?? false;
    const timeFrom = normalizeTime(pickDefined(body, ['TimeFrom', 'timeFrom'])) ?? null;
    const timeTo = normalizeTime(pickDefined(body, ['TimeTo', 'timeTo'])) ?? null;
    const offDay = pickString(body, 'OffDay', 'offDay') ?? null;
    const status = toStoredStatus(pickDefined(body, ['status', 'Status']), 'ACTIVE');

    const createdUser = await prisma.$transaction(async (tx) => {
      const generatedUserId = crypto.randomUUID();
      const syncedUserId = await upsertGlobalUserForCreate(tx, {
        userId: generatedUserId,
        email,
        name,
        roleId: roleId ?? null,
        status,
        password,
      });

      return tx.organizationUser.create({
        data: {
          userId: syncedUserId,
          organizationId,
          roleId: roleId ?? null,
          name,
          email,
          status,
          permissionsAllowJson: stringifyArray(allowPermissions),
          permissionsDenyJson: stringifyArray(denyPermissions),
          branchesJson: stringifyArray(branches),
          backDaysLimit,
          timeRestrictionEnabled,
          timeFrom: timeRestrictionEnabled ? timeFrom : null,
          timeTo: timeRestrictionEnabled ? timeTo : null,
          offDay,
          joinedAt: new Date(),
          invitedBy: actorUserId,
        },
      });
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'User created successfully.',
        userId: createdUser.userId,
        data: {
          userId: createdUser.userId,
          organizationUserId: createdUser.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const prismaError = error as Prisma.PrismaClientKnownRequestError;
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { status: 'exists', message: 'Email already exists for this tenant.' },
        { status: 200 }
      );
    }

    console.error('POST /api/users failed', error);
    return NextResponse.json({ message: 'Failed to create user.' }, { status: 500 });
  }
}
