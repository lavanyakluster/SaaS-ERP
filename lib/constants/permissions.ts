/**
 * Permissions Configuration
 * Derived from navigation structure with Main Menu and Submenu hierarchy
 */

import { NAVIGATION_MENU } from './navigation';
import { Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ModulePermission {
  id: string;
  label: string;
  isMainMenu: boolean;
  icon?: LucideIcon;
  submenus?: Array<{
    id: string;
    label: string;
  }>;
  parentId?: string;
}

/**
 * Module permissions derived from NAVIGATION_MENU
 * Automatically syncs with sidebar navigation
 */
const navigationModulePermissions: ModulePermission[] = NAVIGATION_MENU.flatMap((navItem) => {
  const mainMenuId = navItem.label.toLowerCase().replace(/\s+/g, '_');
  
  // Create main menu item
  const mainMenu: ModulePermission = {
    id: mainMenuId,
    label: navItem.label,
    isMainMenu: true,
    icon: navItem.icon,
    submenus: navItem.children?.map((child) => ({
      id: `${mainMenuId}_${child.page}`,
      label: child.label,
    })),
  };

  // Create submenu items
  const submenus: ModulePermission[] = navItem.children?.map((child) => ({
    id: `${mainMenuId}_${child.page}`,
    label: child.label,
    isMainMenu: false,
    parentId: mainMenuId,
  })) || [];

  return [mainMenu, ...submenus];
});

const settingsModulePermission: ModulePermission = {
  id: 'settings',
  label: 'Settings',
  isMainMenu: true,
  icon: Settings,
  submenus: [],
};

export const MODULE_PERMISSIONS: ModulePermission[] = [
  ...navigationModulePermissions,
  settingsModulePermission,
];

/**
 * Additional granular permissions (checkboxes)
 */
export interface AdditionalPermission {
  id: string;
  label: string;
}

export const ADDITIONAL_PERMISSIONS: AdditionalPermission[] = [
  { id: 'edit_rate', label: 'Edit Rate' },
  { id: 'show_cost', label: 'Show Cost' },
  { id: 'edit_voucher', label: 'Edit Voucher' },
];

/**
 * Off Day options
 */
export const OFF_DAY_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
];

/**
 * User Role options
 */
export const USER_ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'manager', label: 'Manager' },
];
