import { type Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getAuthContext,
  isRecord,
  mapRoleToApi,
  normalizeTime,
  pickBoolean,
  pickDefined,
  pickNumber,
  pickString,
  stringifyArray,
  toJsonArray,
  toStoredStatus,
} from '@/lib/server/users-roles';

export const runtime = 'nodejs';

const buildRolePayload = (
  body: Record<string, unknown>,
  fallback?: {
    name: string;
    description: string | null;
    permissions: string[];
    branches: string[];
    additionalPermissions: string[];
    backDaysLimit: number;
    timeRestrictionEnabled: boolean;
    timeFrom: string | null;
    timeTo: string | null;
    offDay: string | null;
    status: string;
  }
) => {
  const name = pickString(body, 'Role', 'role', 'name') ?? fallback?.name;
  const description = pickString(body, 'Description', 'description') ?? fallback?.description ?? '';

  const permissionsRaw = pickDefined(body, ['Permissions', 'permissions']);
  const permissions = permissionsRaw === undefined ? fallback?.permissions ?? [] : toJsonArray(permissionsRaw);

  const branchesRaw = pickDefined(body, ['Branches', 'branches']);
  const branches = branchesRaw === undefined ? fallback?.branches ?? [] : toJsonArray(branchesRaw);

  const additionalPermissionsRaw = pickDefined(body, ['AdditionalPermissions', 'additionalPermissions']);
  const additionalPermissions =
    additionalPermissionsRaw === undefined
      ? fallback?.additionalPermissions ?? []
      : toJsonArray(additionalPermissionsRaw);

  const backDaysLimit = pickNumber(body, 'BackDaysLimit', 'backDaysLimit') ?? fallback?.backDaysLimit ?? 0;
  const timeRestrictionEnabled =
    pickBoolean(body, 'TimeRestrictionEnabled', 'timeRestrictionEnabled') ??
    fallback?.timeRestrictionEnabled ??
    false;

  const timeFromRaw = pickDefined(body, ['TimeFrom', 'timeFrom']);
  const timeFrom = timeFromRaw === undefined ? fallback?.timeFrom ?? null : normalizeTime(timeFromRaw);

  const timeToRaw = pickDefined(body, ['TimeTo', 'timeTo']);
  const timeTo = timeToRaw === undefined ? fallback?.timeTo ?? null : normalizeTime(timeToRaw);

  const offDayRaw = pickDefined(body, ['OffDay', 'offDay']);
  const offDay = offDayRaw === undefined ? fallback?.offDay ?? null : pickString(body, 'OffDay', 'offDay') ?? null;

  const statusRaw = pickDefined(body, ['status', 'Status']);
  const status = statusRaw === undefined ? fallback?.status ?? 'ACTIVE' : toStoredStatus(statusRaw, 'ACTIVE');

  return {
    name,
    description,
    permissions,
    branches,
    additionalPermissions,
    backDaysLimit,
    timeRestrictionEnabled,
    timeFrom: timeRestrictionEnabled ? timeFrom : null,
    timeTo: timeRestrictionEnabled ? timeTo : null,
    offDay,
    status,
  };
};

export async function GET(request: NextRequest) {
  try {
    const { organizationId } = getAuthContext(request);

    const roles = await prisma.role.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      status: 200,
      data: roles.map(mapRoleToApi),
    });
  } catch (error) {
    console.error('GET /api/roles failed', error);
    return NextResponse.json({ message: 'Failed to fetch roles.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json().catch(() => ({}));
    const body = isRecord(rawBody) ? rawBody : {};
    const { organizationId } = getAuthContext(request);

    const payload = buildRolePayload(body);

    if (!payload.name) {
      return NextResponse.json({ message: 'Role name is required.' }, { status: 400 });
    }

    const existingRole = await prisma.role.findFirst({
      where: {
        organizationId,
        name: payload.name,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        {
          status: 'exists',
          message: `Role "${payload.name}" already exists.`,
          data: mapRoleToApi(existingRole),
        },
        { status: 200 }
      );
    }

    const createdRole = await prisma.role.create({
      data: {
        organizationId,
        name: payload.name,
        description: payload.description,
        permissionsJson: stringifyArray(payload.permissions),
        branchesJson: stringifyArray(payload.branches),
        additionalPermissionsJson: stringifyArray(payload.additionalPermissions),
        backDaysLimit: payload.backDaysLimit,
        timeRestrictionEnabled: payload.timeRestrictionEnabled,
        timeFrom: payload.timeFrom,
        timeTo: payload.timeTo,
        offDay: payload.offDay,
        status: payload.status,
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Role created successfully.',
        data: mapRoleToApi(createdRole),
      },
      { status: 201 }
    );
  } catch (error) {
    const prismaError = error as Prisma.PrismaClientKnownRequestError;
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { status: 'exists', message: 'Role name already exists for this organization.' },
        { status: 200 }
      );
    }

    console.error('POST /api/roles failed', error);
    return NextResponse.json({ message: 'Failed to create role.' }, { status: 500 });
  }
}
