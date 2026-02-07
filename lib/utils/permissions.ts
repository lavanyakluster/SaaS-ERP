/**
 * Permissions Utilities
 * Helper functions for transforming permissions data
 */

import { CrudPermission } from '@/hooks/usePermissions';

/**
 * Transform module permissions to API format
 * Converts CRUD permissions to array of permission strings
 */
export const transformPermissionsToApi = (
  modulePermissions: Record<string, CrudPermission>
): string[] => {
  const permissions: string[] = [];

  Object.entries(modulePermissions).forEach(([moduleId, perms]) => {
    // Only add permissions that are checked
    if (perms.add) permissions.push(`add_${moduleId}`);
    if (perms.view) permissions.push(`view_${moduleId}`);
    if (perms.edit) permissions.push(`edit_${moduleId}`);
    if (perms.delete) permissions.push(`delete_${moduleId}`);
  });

  return permissions;
};

/**
 * Transform additional permissions to API format
 */
export const transformAdditionalPermissionsToApi = (
  additionalPermissions: Record<string, boolean>
): string[] => {
  return Object.entries(additionalPermissions)
    .filter(([_, enabled]) => enabled)
    .map(([permId, _]) => permId);
};

/**
 * Combine all permissions into a single array for API
 */
export const combineAllPermissions = (
  modulePermissions: Record<string, CrudPermission>,
  additionalPermissions: Record<string, boolean>
): string[] => {
  const modulePerms = transformPermissionsToApi(modulePermissions);
  const additionalPerms = transformAdditionalPermissionsToApi(additionalPermissions);
  
  return [...modulePerms, ...additionalPerms];
};

/**
 * Parse module permissions from API response
 * Converts API permission format to UI form structure
 */
export const parseModulePermissionsFromApi = (
  permissions: string[]
): Record<string, CrudPermission> => {
  // Handle undefined/null permissions
  if (!permissions || !Array.isArray(permissions)) {
    return {};
  }

  const modulePermissions: Record<string, CrudPermission> = {};

  permissions.forEach((perm) => {
    // Match pattern: add_moduleName, view_moduleName, etc.
    const match = perm.match(/^(add|view|edit|delete)_(.+)$/);
    
    if (match) {
      const [, action, moduleId] = match;
      
      if (!modulePermissions[moduleId]) {
        modulePermissions[moduleId] = {
          add: false,
          view: false,
          edit: false,
          delete: false,
        };
      }
      
      modulePermissions[moduleId][action as keyof CrudPermission] = true;
    }
  });

  return modulePermissions;
};

/**
 * Parse additional permissions from API response
 * Extracts permissions that don't follow CRUD pattern
 */
export const parseAdditionalPermissionsFromApi = (
  permissions: string[]
): Record<string, boolean> => {
  // Handle undefined/null permissions
  if (!permissions || !Array.isArray(permissions)) {
    return {};
  }

  const additionalPermissions: Record<string, boolean> = {};

  permissions.forEach((perm) => {
    // If permission doesn't match CRUD pattern, it's an additional permission
    if (!perm.match(/^(add|view|edit|delete)_/)) {
      additionalPermissions[perm] = true;
    }
  });

  return additionalPermissions;
};