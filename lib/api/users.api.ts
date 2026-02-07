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
}

export interface CreateUserRequest {
  name: string;
  email: string;
  roleid: string;
  permissions: {
    allow: string[];
    deny: string[];
  };
}

export interface CreateUserResponse {
  status?: string;
  message: string;
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