import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getAuthContext,
  isRecord,
  mapRoleToApi,
  normalizeTime,
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

type RouteContext = {
  params: Promise<{ roleId: string }>;
};

const findRole = async (organizationId: string, roleId: string) =>
  prisma.role.findFirst({
    where: {
      organizationId,
      id: roleId,
    },
  });

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { roleId } = await context.params;
    const { organizationId } = getAuthContext(request);

    const role = await findRole(organizationId, roleId);
    if (!role) {
      return NextResponse.json({ message: 'Role not found.' }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      data: mapRoleToApi(role),
    });
  } catch (error) {
    console.error('GET /api/roles/[roleId] failed', error);
    return NextResponse.json({ message: 'Failed to fetch role.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { roleId } = await context.params;
    const rawBody: unknown = await request.json().catch(() => ({}));
    const body = isRecord(rawBody) ? rawBody : {};
    const { organizationId } = getAuthContext(request);

    const existingRole = await findRole(organizationId, roleId);
    if (!existingRole) {
      return NextResponse.json({ message: 'Role not found.' }, { status: 404 });
    }

    const name = pickString(body, 'Role', 'role', 'name') ?? existingRole.name;
    const description = pickString(body, 'Description', 'description') ?? existingRole.description ?? '';

    if (!name) {
      return NextResponse.json({ message: 'Role name is required.' }, { status: 400 });
    }

    if (name !== existingRole.name) {
      const duplicate = await prisma.role.findFirst({
        where: {
          organizationId,
          name,
          id: { not: existingRole.id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { status: 'exists', message: `Role "${name}" already exists.` },
          { status: 200 }
        );
      }
    }

    const permissionsRaw = pickDefined(body, ['Permissions', 'permissions']);
    const permissions =
      permissionsRaw === undefined ? parseStoredArray(existingRole.permissionsJson) : toJsonArray(permissionsRaw);

    const branchesRaw = pickDefined(body, ['Branches', 'branches']);
    const branches =
      branchesRaw === undefined ? parseStoredArray(existingRole.branchesJson) : toJsonArray(branchesRaw);

    const additionalPermissionsRaw = pickDefined(body, ['AdditionalPermissions', 'additionalPermissions']);
    const additionalPermissions =
      additionalPermissionsRaw === undefined
        ? parseStoredArray(existingRole.additionalPermissionsJson)
        : toJsonArray(additionalPermissionsRaw);

    const backDaysLimit = pickNumber(body, 'BackDaysLimit', 'backDaysLimit') ?? existingRole.backDaysLimit;
    const timeRestrictionEnabled =
      pickBoolean(body, 'TimeRestrictionEnabled', 'timeRestrictionEnabled') ??
      existingRole.timeRestrictionEnabled;

    const timeFromRaw = pickDefined(body, ['TimeFrom', 'timeFrom']);
    const timeFrom = timeFromRaw === undefined ? existingRole.timeFrom : normalizeTime(timeFromRaw);

    const timeToRaw = pickDefined(body, ['TimeTo', 'timeTo']);
    const timeTo = timeToRaw === undefined ? existingRole.timeTo : normalizeTime(timeToRaw);

    const offDayRaw = pickDefined(body, ['OffDay', 'offDay']);
    const offDay = offDayRaw === undefined ? existingRole.offDay : pickString(body, 'OffDay', 'offDay') ?? null;

    const statusRaw = pickDefined(body, ['status', 'Status']);
    const status = statusRaw === undefined ? existingRole.status : toStoredStatus(statusRaw, existingRole.status);

    const updatedRole = await prisma.role.update({
      where: { id: existingRole.id },
      data: {
        name,
        description,
        permissionsJson: stringifyArray(permissions),
        branchesJson: stringifyArray(branches),
        additionalPermissionsJson: stringifyArray(additionalPermissions),
        backDaysLimit,
        timeRestrictionEnabled,
        timeFrom: timeRestrictionEnabled ? timeFrom : null,
        timeTo: timeRestrictionEnabled ? timeTo : null,
        offDay,
        status,
      },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Role updated successfully.',
      data: mapRoleToApi(updatedRole),
    });
  } catch (error) {
    console.error('PUT /api/roles/[roleId] failed', error);
    return NextResponse.json({ message: 'Failed to update role.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { roleId } = await context.params;
    const { organizationId } = getAuthContext(request);

    const existingRole = await findRole(organizationId, roleId);
    if (!existingRole) {
      return NextResponse.json({ message: 'Role not found.' }, { status: 404 });
    }

    const usersCount = await prisma.organizationUser.count({
      where: {
        organizationId,
        roleId: existingRole.id,
      },
    });

    if (usersCount > 0) {
      return NextResponse.json(
        { message: 'Role is assigned to one or more users. Reassign users before deleting the role.' },
        { status: 409 }
      );
    }

    await prisma.role.delete({
      where: { id: existingRole.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully.',
    });
  } catch (error) {
    console.error('DELETE /api/roles/[roleId] failed', error);
    return NextResponse.json({ message: 'Failed to delete role.' }, { status: 500 });
  }
}
