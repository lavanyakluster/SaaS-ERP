/**
 * Users API
 * Local Prisma-backed CRUD endpoints for settings UI
 */

import { settingsApiClient } from './settings-local-client';
import { apiClient } from './client';

// ============================================================================
// Types
// ============================================================================

export interface User {
  organizationUserId: string;
  userId: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  status: string;
  joinedAt: Record<string, never> | string;
  permissions: string[];
}

export interface UserDetails {
  organizationUserId: string;
  userId: string;
  email: string;
  name: string;
  roleId: string;
  status: string;
  permissions: {
    allow: string[];
    deny: string[];
  };
  branches?: string[];
  Branches?: string[];
  backDaysLimit?: number;
  timeRestrictionEnabled?: boolean;
  timeFrom?: string;
  timeTo?: string;
  offDay?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
  roleid?: string;
  roleId?: string;
  permissions: {
    allow: string[];
    deny: string[];
  };
  Branches?: string[];
  branches?: string[];
  status?: boolean | string;
  backDaysLimit?: number;
  timeRestrictionEnabled?: boolean;
  timeFrom?: string;
  timeTo?: string;
  offDay?: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  password?: string;
  roleid?: string;
  roleId?: string;
  permissions: {
    allow: string[];
    deny: string[];
  };
  Branches?: string[];
  branches?: string[];
  status?: boolean | string;
  backDaysLimit?: number;
  timeRestrictionEnabled?: boolean;
  timeFrom?: string;
  timeTo?: string;
  offDay?: string;
}

export interface CreateUserResponse {
  status?: string;
  message: string;
  userId?: string;
  data?: {
    userId?: string;
    organizationUserId?: string;
  };
}

export interface DeleteUserResponse {
  success?: boolean;
  message: string;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  message?: string;
}

export interface ChangeEmailRequest {
  NewEmail: string;
}

export interface ChangeEmailResponse {
  success?: boolean;
  message: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get all users in the selected organization.
 */
export const getUsers = async (): Promise<User[]> => {
  const response = await settingsApiClient.get<User[]>('/users');
  return response.data;
};

export interface GetUserDetailResponse {
  status: number;
  data: UserDetails;
}

/**
 * Get user by ID.
 */
export const getUserById = async (userId: string): Promise<UserDetails> => {
  const response = await settingsApiClient.get<GetUserDetailResponse>(`/users/${userId}`);
  return response.data.data;
};

/**
 * Create a new user.
 */
export const createUser = async (user: CreateUserRequest): Promise<CreateUserResponse> => {
  const response = await settingsApiClient.post<CreateUserResponse>('/users', user);
  return response.data;
};

/**
 * Delete a user.
 */
export const deleteUser = async (userId: string): Promise<DeleteUserResponse> => {
  const response = await settingsApiClient.delete<DeleteUserResponse>(`/users/${userId}`);
  return response.data;
};

/**
 * Update a user.
 */
export const updateUser = async (userId: string, user: UpdateUserRequest): Promise<CreateUserResponse> => {
  const response = await settingsApiClient.put<CreateUserResponse>(`/users/${userId}`, user);
  return response.data;
};

/**
 * Change a user's email.
 */
export const changeEmail = async (userId: string, email: ChangeEmailRequest): Promise<ChangeEmailResponse> => {
  const response = await apiClient.put(`/ChangeEmail/${userId}`, email);
  const payload = response.data as { success?: boolean; message?: string; Message?: string } | undefined;

  return {
    success: payload?.success ?? true,
    message: payload?.message ?? payload?.Message ?? 'Email update request submitted.',
  };
};
