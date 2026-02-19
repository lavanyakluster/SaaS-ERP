/**
 * Roles API
 * Local Prisma-backed CRUD endpoints for settings UI
 */

import { settingsApiClient } from './settings-local-client';

export interface CreateRoleRequest {
  Role?: string;
  role?: string;
  name?: string;
  Description?: string;
  description?: string;
  Permissions?: string[];
  permissions?: string[];
  Branches?: string[];
  branches?: string[];
  AdditionalPermissions?: string[];
  additionalPermissions?: string[];
  BackDaysLimit?: number;
  backDaysLimit?: number;
  TimeRestrictionEnabled?: boolean;
  timeRestrictionEnabled?: boolean;
  TimeFrom?: string;
  timeFrom?: string;
  TimeTo?: string;
  timeTo?: string;
  OffDay?: string;
  offDay?: string;
  status?: string;
}

export type UpdateRoleRequest = CreateRoleRequest;

export interface CreateRoleResponse {
  status: string;
  message?: string;
  data?: Role;
}

export interface UpdateRoleResponse {
  status: string;
  message?: string;
  data?: Role;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  created_At: string;
  createdAt?: string;
  permissions: string[];
  branches?: string[];
  additionalPermissions?: string[];
  backDaysLimit?: number;
  timeRestrictionEnabled?: boolean;
  timeFrom?: string;
  timeTo?: string;
  offDay?: string;
  status?: string;
}

export interface GetRolesResponse {
  status: number;
  data: Role[];
}

/**
 * Create a new role
 */
export const createRole = async (data: CreateRoleRequest): Promise<CreateRoleResponse> => {
  const response = await settingsApiClient.post<CreateRoleResponse>('/roles', data);
  return response.data;
};

/**
 * Get all roles
 */
export const getRoles = async (): Promise<GetRolesResponse> => {
  const response = await settingsApiClient.get<GetRolesResponse>('/roles');
  return response.data;
};

export interface GetRoleResponse {
  status: number;
  data: Role;
}

/**
 * Get role by ID
 */
export const getRoleById = async (roleId: string): Promise<Role> => {
  const response = await settingsApiClient.get<GetRoleResponse>(`/roles/${roleId}`);
  return response.data.data;
};

/**
 * Update an existing role
 */
export const updateRole = async (roleId: string, data: UpdateRoleRequest): Promise<UpdateRoleResponse> => {
  const response = await settingsApiClient.put<UpdateRoleResponse>(`/roles/${roleId}`, data);
  return response.data;
};

/**
 * Delete a role
 */
export const deleteRole = async (roleId: string): Promise<void> => {
  await settingsApiClient.delete(`/roles/${roleId}`);
};
