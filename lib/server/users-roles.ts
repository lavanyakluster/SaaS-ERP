import type { OrganizationUser, Role } from '@prisma/client';
import type { NextRequest } from 'next/server';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000000';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const NAME_IDENTIFIER_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

const uniqueStrings = (values: string[]): string[] => Array.from(new Set(values));

export type RolePreview = Pick<Role, 'name' | 'permissionsJson'>;
export type OrganizationUserWithRole = OrganizationUser & { role: RolePreview | null };

export interface SettingsAuthContext {
  organizationId: string;
  actorUserId: string | null;
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOwn = (value: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

export const pickDefined = (value: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    if (hasOwn(value, key)) {
      return value[key];
    }
  }
  return undefined;
};

export const pickString = (value: Record<string, unknown>, ...keys: string[]): string | undefined => {
  const picked = pickDefined(value, keys);
  if (typeof picked !== 'string') {
    return undefined;
  }

  const trimmed = picked.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const pickNumber = (value: Record<string, unknown>, ...keys: string[]): number | undefined => {
  const picked = pickDefined(value, keys);
  if (typeof picked === 'number' && Number.isFinite(picked)) {
    return picked;
  }
  if (typeof picked === 'string') {
    const parsed = Number(picked);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

export const pickBoolean = (value: Record<string, unknown>, ...keys: string[]): boolean | undefined => {
  const picked = pickDefined(value, keys);
  if (typeof picked === 'boolean') {
    return picked;
  }
  if (typeof picked === 'string') {
    const normalized = picked.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') {
      return true;
    }
    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }
  if (typeof picked === 'number') {
    if (picked === 1) return true;
    if (picked === 0) return false;
  }
  return undefined;
};

export const isUuid = (value: string): boolean => UUID_REGEX.test(value);

const normalizeUuid = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return isUuid(trimmed) ? trimmed : undefined;
};

const firstValidUuid = (values: Array<string | null | undefined>): string | undefined => {
  for (const value of values) {
    const normalized = normalizeUuid(value);
    if (normalized) {
      return normalized;
    }
  }
  return undefined;
};

const parseJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const getAuthContext = (request: NextRequest): SettingsAuthContext => {
  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
  const jwtPayload = bearer ? parseJwtPayload(bearer) : null;

  const orgFromHeader = request.headers.get('x-organization-id');
  const orgFromQuery = request.nextUrl.searchParams.get('organizationId');
  const orgFromToken = jwtPayload ? pickString(jwtPayload, 'organizationId', 'organization_id', 'orgId') : undefined;
  const orgFromEnv = process.env.DEFAULT_ORGANIZATION_ID;

  const organizationId =
    firstValidUuid([orgFromHeader, orgFromQuery, orgFromToken, orgFromEnv]) ?? DEFAULT_ORG_ID;

  const actorUserId = jwtPayload
    ? firstValidUuid([
        pickString(jwtPayload, NAME_IDENTIFIER_CLAIM),
        pickString(jwtPayload, 'userId'),
        pickString(jwtPayload, 'sub'),
      ]) ?? null
    : null;

  return {
    organizationId,
    actorUserId,
  };
};

export const toJsonArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return uniqueStrings(
      value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    );
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return uniqueStrings(
          parsed
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        );
      }
    } catch {
      return [trimmed];
    }

    return [];
  }

  return [];
};

export const parseStoredArray = (value: string | null | undefined): string[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return uniqueStrings(
      parsed
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    );
  } catch {
    return [];
  }
};

export const stringifyArray = (value: string[]): string => JSON.stringify(uniqueStrings(value));

export const normalizeTime = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return TIME_REGEX.test(trimmed) ? trimmed : null;
};

export const toStoredStatus = (value: unknown, fallback: string = 'ACTIVE'): string => {
  if (typeof value === 'boolean') {
    return value ? 'ACTIVE' : 'INACTIVE';
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase();
    if (normalized === 'ACTIVE' || normalized === 'ENABLED' || normalized === 'TRUE') {
      return 'ACTIVE';
    }
    if (normalized === 'INACTIVE' || normalized === 'DISABLED' || normalized === 'FALSE') {
      return 'INACTIVE';
    }
    if (normalized) {
      return normalized;
    }
  }

  return fallback.toUpperCase();
};

export const toDisplayStatus = (value: string): string => {
  if (!value) {
    return 'Inactive';
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === 'ACTIVE') return 'Active';
  if (normalized === 'INACTIVE') return 'Inactive';
  if (normalized === 'PENDING') return 'Pending';

  return normalized.charAt(0) + normalized.slice(1).toLowerCase();
};

export const parsePermissionsPayload = (
  value: unknown,
  fallback: { allow: string[]; deny: string[] } = { allow: [], deny: [] }
): { allow: string[]; deny: string[] } => {
  if (value === undefined) {
    return fallback;
  }

  if (isRecord(value)) {
    const allowRaw = pickDefined(value, ['allow', 'Allow', 'permissions', 'Permissions']);
    const denyRaw = pickDefined(value, ['deny', 'Deny']);
    return {
      allow: allowRaw === undefined ? fallback.allow : toJsonArray(allowRaw),
      deny: denyRaw === undefined ? fallback.deny : toJsonArray(denyRaw),
    };
  }

  return {
    allow: toJsonArray(value),
    deny: fallback.deny,
  };
};

export const mapRoleToApi = (role: Role) => {
  const permissions = parseStoredArray(role.permissionsJson);
  const branches = parseStoredArray(role.branchesJson);
  const additionalPermissions = parseStoredArray(role.additionalPermissionsJson);

  return {
    id: role.id,
    name: role.name,
    description: role.description ?? '',
    created_At: role.createdAt.toISOString(),
    createdAt: role.createdAt.toISOString(),
    permissions,
    branches,
    additionalPermissions,
    backDaysLimit: role.backDaysLimit,
    timeRestrictionEnabled: role.timeRestrictionEnabled,
    timeFrom: role.timeFrom ?? '09:00',
    timeTo: role.timeTo ?? '18:00',
    offDay: role.offDay ?? 'none',
    status: toDisplayStatus(role.status),
  };
};

export const mapUserToListApi = (user: OrganizationUserWithRole) => {
  const allowPermissions = parseStoredArray(user.permissionsAllowJson);
  const rolePermissions = user.role ? parseStoredArray(user.role.permissionsJson) : [];
  const effectivePermissions = allowPermissions.length > 0 ? allowPermissions : rolePermissions;

  return {
    organizationUserId: user.id,
    userId: user.userId,
    email: user.email,
    name: user.name,
    roleId: user.roleId ?? '',
    roleName: user.role?.name ?? 'Unassigned',
    status: toDisplayStatus(user.status),
    joinedAt: (user.joinedAt ?? user.createdAt).toISOString(),
    permissions: effectivePermissions,
  };
};

export const mapUserToDetailApi = (user: OrganizationUserWithRole) => {
  const allowPermissions = parseStoredArray(user.permissionsAllowJson);
  const denyPermissions = parseStoredArray(user.permissionsDenyJson);
  const branches = parseStoredArray(user.branchesJson);

  return {
    organizationUserId: user.id,
    userId: user.userId,
    email: user.email,
    name: user.name,
    roleId: user.roleId ?? '',
    status: toDisplayStatus(user.status),
    permissions: {
      allow: allowPermissions,
      deny: denyPermissions,
    },
    branches,
    backDaysLimit: user.backDaysLimit,
    timeRestrictionEnabled: user.timeRestrictionEnabled,
    timeFrom: user.timeFrom ?? '09:00',
    timeTo: user.timeTo ?? '18:00',
    offDay: user.offDay ?? 'none',
  };
};
