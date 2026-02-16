/**
 * Users API
 * API functions for user management
 */

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
  branches?: string[]; // Branches assigned to user (if API returns this)
}

export interface CreateUserRequest {
  name: string;
  email: string;
  roleid: string;
  permissions: {
    allow: string[];
    deny: string[];
  };
  Branches: string[];
  status: boolean;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  roleid: string;
  permissions: {
    allow: string[];
    deny: string[];
  };
  Branches: string[];
  // Note: status is NOT included in update requests per API spec
}

export interface CreateUserResponse {
  status?: string;
  message: string;
  userId?: string; // ✅ Add userId to response (returned by API after creation)
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
 * Get all users in the organization
 * Organization context is derived from the JWT token
 */
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
};

/**
 * Get user by ID
 * @param userId - The user ID to fetch
 */
export const getUserById = async (userId: string): Promise<UserDetails> => {
  const response = await apiClient.get<UserDetails>(`/user/${userId}`);
  return response.data;
};

/**
 * Create a new user
 * @param user - The user details to create
 */
export const createUser = async (user: CreateUserRequest): Promise<CreateUserResponse> => {
  const response = await apiClient.post<CreateUserResponse>('/user', user);
  return response.data;
};

/**
 * Delete a user
 * @param userId - The user ID to delete
 */
export const deleteUser = async (userId: string): Promise<DeleteUserResponse> => {
  const response = await apiClient.delete<DeleteUserResponse>(`/user/${userId}`);
  return response.data;
};

/**
 * Update a user
 * @param userId - The user ID to update
 * @param user - The user details to update
 */
export const updateUser = async (userId: string, user: UpdateUserRequest): Promise<CreateUserResponse> => {
  const response = await apiClient.put<CreateUserResponse>(`/user/${userId}`, user);
  return response.data;
};

/**
 * Change a user's email
 * @param userId - The user ID to update
 * @param email - The new email address
 */
export const changeEmail = async (userId: string, email: ChangeEmailRequest): Promise<ChangeEmailResponse> => {
  const response = await apiClient.put<ChangeEmailResponse>(`/ChangeEmail/${userId}`, email);
  return response.data;
};