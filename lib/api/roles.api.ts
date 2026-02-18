/**
 * Roles API
 * Handles role management operations
 */

import { apiClient } from './client';

export interface PermissionObject {
  allow: string[];
  deny?: string[];
  backDays?: number;
  timeRestrictionEnabled?: boolean;
  timeFrom?: string;
  timeTo?: string;
  offDay?: string;
}

export interface CreateRoleRequest {
  Role: string;
  Description: string;
  Permissions: string[];
}

export interface UpdateRoleRequest {
  Role: string;
  Description: string;
  Permissions: string[];
}

export interface CreateRoleResponse {
  status: string;
}

export interface UpdateRoleResponse {
  status: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  created_At: string;
  permissions: string[];
}

export interface GetRolesResponse {
  status: number;
  data: Role[];
}

/**
 * Create a new role
 */
export const createRole = async (data: CreateRoleRequest): Promise<CreateRoleResponse> => {
  const response = await apiClient.post<CreateRoleResponse>('/roles', data);
  return response.data;
};

/**
 * Get all roles
 */
export const getRoles = async (): Promise<GetRolesResponse> => {
  const response = await apiClient.get<GetRolesResponse>('/roles');
  return response.data;
};

/**
 * Get role by ID
 */
export const getRoleById = async (roleId: string): Promise<Role> => {
  const response = await apiClient.get<Role>(`/roles/${roleId}`);
  return response.data;
};

/**
 * Update an existing role
 */
export const updateRole = async (roleId: string, data: UpdateRoleRequest): Promise<UpdateRoleResponse> => {
  const response = await apiClient.put<UpdateRoleResponse>(`/roles/${roleId}`, data);
  return response.data;
};

/**
 * Delete a role
 */
export const deleteRole = async (roleId: string): Promise<void> => {
  await apiClient.delete(`/roles/${roleId}`);
};