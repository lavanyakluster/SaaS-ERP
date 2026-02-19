/**
 * Users Hooks
 * React Query hooks for user management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
  changeEmail,
  CreateUserRequest,
  UpdateUserRequest,
  ChangeEmailRequest,
} from '@/lib/api/users.api';

/**
 * Hook to fetch all users
 */
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000, // ⚡ 5 minutes cache
    gcTime: 10 * 60 * 1000, // 🗑️ 10 minutes garbage collection
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch user by ID
 */
export const useUserById = (userId: string | null) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId!),
    enabled: !!userId, // Only fetch when userId is provided
    staleTime: 5 * 60 * 1000, // ⚡ 5 minutes cache
    gcTime: 10 * 60 * 1000, // 🗑️ 10 minutes garbage collection
  });
};

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Hook to update a user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string, userData: UpdateUserRequest }) => updateUser(data.userId, data.userData),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Hook to change user email
 */
export const useChangeEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; emailData: ChangeEmailRequest }) =>
      changeEmail(data.userId, data.emailData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
};
