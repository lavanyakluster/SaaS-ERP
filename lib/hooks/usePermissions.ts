import { useState, useCallback } from 'react';
import { MODULE_PERMISSIONS } from '@/lib/constants/permissions';

export type CrudPermission = {
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
};

export interface PermissionsState {
  modulePermissions: Record<string, CrudPermission>;
  selectedBranches: string[];
}

export function usePermissions(initialState?: Partial<PermissionsState>) {
  const [state, setState] = useState<PermissionsState>({
    modulePermissions: initialState?.modulePermissions || {},
    selectedBranches: initialState?.selectedBranches || [],
  });

  const handleModulePermissionToggle = useCallback((moduleId: string, permission: keyof CrudPermission) => {
    setState(prev => {
      const newPermissions = {
        ...prev.modulePermissions,
        [moduleId]: {
          add: prev.modulePermissions[moduleId]?.add || false,
          view: prev.modulePermissions[moduleId]?.view || false,
          edit: prev.modulePermissions[moduleId]?.edit || false,
          delete: prev.modulePermissions[moduleId]?.delete || false,
          [permission]: !prev.modulePermissions[moduleId]?.[permission],
        },
      };

      // Find the module
      const module = MODULE_PERMISSIONS.find(m => m.id === moduleId);
      
      // If this is a main menu with submenus, cascade to submenus
      if (module?.isMainMenu && module.submenus && module.submenus.length > 0) {
        const newValue = newPermissions[moduleId][permission];
        module.submenus.forEach(submenu => {
          newPermissions[submenu.id] = {
            add: prev.modulePermissions[submenu.id]?.add || false,
            view: prev.modulePermissions[submenu.id]?.view || false,
            edit: prev.modulePermissions[submenu.id]?.edit || false,
            delete: prev.modulePermissions[submenu.id]?.delete || false,
            [permission]: newValue,
          };
        });
      }

      return {
        ...prev,
        modulePermissions: newPermissions,
      };
    });
  }, []);

  const handleModuleSelectAll = useCallback((moduleId: string) => {
    setState(prev => {
      const allSelected = prev.modulePermissions[moduleId]?.add &&
        prev.modulePermissions[moduleId]?.view &&
        prev.modulePermissions[moduleId]?.edit &&
        prev.modulePermissions[moduleId]?.delete;

      const newPermissions = {
        ...prev.modulePermissions,
        [moduleId]: {
          add: !allSelected,
          view: !allSelected,
          edit: !allSelected,
          delete: !allSelected,
        },
      };

      // Find the module
      const module = MODULE_PERMISSIONS.find(m => m.id === moduleId);
      
      // If this is a main menu with submenus, cascade to all submenus
      if (module?.isMainMenu && module.submenus && module.submenus.length > 0) {
        module.submenus.forEach(submenu => {
          newPermissions[submenu.id] = {
            add: !allSelected,
            view: !allSelected,
            edit: !allSelected,
            delete: !allSelected,
          };
        });
      }

      return {
        ...prev,
        modulePermissions: newPermissions,
      };
    });
  }, []);

  const handleBranchToggle = useCallback((branchId: string) => {
    setState(prev => {
      const isSelected = prev.selectedBranches.includes(branchId);
      return {
        ...prev,
        selectedBranches: isSelected
          ? prev.selectedBranches.filter(id => id !== branchId)
          : [...prev.selectedBranches, branchId],
      };
    });
  }, []);

  const handleSelectAllBranches = useCallback((filteredBranchIds: string[]) => {
    setState(prev => {
      const allFilteredSelected = filteredBranchIds.every(id => prev.selectedBranches.includes(id));
      
      if (allFilteredSelected) {
        return {
          ...prev,
          selectedBranches: prev.selectedBranches.filter(id => !filteredBranchIds.includes(id)),
        };
      } else {
        return {
          ...prev,
          selectedBranches: [...new Set([...prev.selectedBranches, ...filteredBranchIds])],
        };
      }
    });
  }, []);

  const handleSelectAllModules = useCallback(() => {
    setState(prev => {
      // Get all main menus
      const mainMenus = MODULE_PERMISSIONS.filter(m => m.isMainMenu);
      
      // Check if all modules have all permissions
      const allFullySelected = mainMenus.every(menu => {
        const perms = prev.modulePermissions[menu.id];
        return perms?.add && perms?.view && perms?.edit && perms?.delete;
      });

      // New state: either all selected or all deselected
      const newState = !allFullySelected;

      // Create new permissions object
      const newPermissions: Record<string, CrudPermission> = { ...prev.modulePermissions };

      // Update all main menus and their submenus
      mainMenus.forEach(mainMenu => {
        newPermissions[mainMenu.id] = {
          add: newState,
          view: newState,
          edit: newState,
          delete: newState,
        };

        // Also update submenus
        if (mainMenu.submenus && mainMenu.submenus.length > 0) {
          mainMenu.submenus.forEach(submenu => {
            newPermissions[submenu.id] = {
              add: newState,
              view: newState,
              edit: newState,
              delete: newState,
            };
          });
        }
      });

      return {
        ...prev,
        modulePermissions: newPermissions,
      };
    });
  }, []);

  // Setter functions for programmatic updates
  const setModulePermissions = useCallback((modulePermissions: Record<string, CrudPermission>) => {
    setState(prev => ({
      ...prev,
      modulePermissions,
    }));
  }, []);

  const setBranches = useCallback((branches: string[]) => {
    const uniqueBranches = Array.from(new Set(branches.filter((branch) => typeof branch === 'string' && branch.trim().length > 0)));
    setState(prev => ({
      ...prev,
      selectedBranches: uniqueBranches,
    }));
  }, []);

  return {
    permissions: state,
    handlers: {
      handleModulePermissionToggle,
      handleModuleSelectAll,
      handleSelectAllModules,
      handleBranchToggle,
      handleSelectAllBranches,
      setModulePermissions,
      setBranches,
    },
  };
}
