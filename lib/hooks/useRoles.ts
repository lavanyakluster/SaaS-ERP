/**
 * useRoles Hook
 * React Query hook for managing roles data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, getRoleById, createRole, updateRole, deleteRole, type CreateRoleRequest, type UpdateRoleRequest } from '@/lib/api/roles.api';
import { toast } from 'sonner';

/**
 * Fetch all roles
 */
export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000, // ⚡ 5 minutes cache
    gcTime: 10 * 60 * 1000, // 🗑️ 10 minutes garbage collection
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch role by ID
 */
export function useRoleById(roleId: string | null) {
  return useQuery({
    queryKey: ['roles', roleId],
    queryFn: () => {
      console.log('🔍 Fetching role by ID:', roleId);
      return getRoleById(roleId!);
    },
    enabled: !!roleId, // Only fetch if roleId is provided
    staleTime: 5 * 60 * 1000, // ⚡ 5 minutes cache
    gcTime: 10 * 60 * 1000, // 🗑️ 10 minutes garbage collection
  });
}

/**
 * Create a new role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => createRole(data),
    onSuccess: () => {
      // Invalidate and refetch roles
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create role';
      toast.error(message);
    },
  });
}

/**
 * Update an existing role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: UpdateRoleRequest }) => 
      updateRole(roleId, data),
    onSuccess: () => {
      // Invalidate and refetch roles
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update role';
      toast.error(message);
    },
  });
}

/**
 * Delete a role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: () => {
      // Invalidate and refetch roles
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete role';
      toast.error(message);
    },
  });
}