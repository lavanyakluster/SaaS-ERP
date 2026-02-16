/**
 * Settings Module Types
 * Shared type definitions for settings pages
 */

import { LucideIcon } from 'lucide-react';

// User Management Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'active' | 'pending' | 'suspended';
  avatar?: string;
  department?: string;
  joinedDate: string;
  lastActive?: string;
  location?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: LucideIcon;
  userCount: number;
}

// Permission Types
export interface Permission {
  add: boolean;
  edit: boolean;
  delete: boolean;
  view: boolean;
}

export interface MenuItemType {
  id: string;
  name: string;
  icon: LucideIcon;
  permissions: Permission;
  subMenus?: MenuItemType[];
}

export interface RoleType {
  id: string;
  name: string;
  description: string;
  userCount: number;
  color: string;
  isDefault?: boolean;
  permissions: {
    [key: string]: Permission;
  };
}

// Settings Types
export type SettingsCategory = 
  | 'organization'
  | 'tenant-config'
  | 'users-access'
  | 'modules'
  | 'integrations'
  | 'security'
  | 'billing';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
  avatar?: string;
  phone?: string;
  teams: string[];
  joinedDate: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: {
    module: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  }[];
  isDefault?: boolean;
  color: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  members: string[];
  lead?: string;
  color: string;
}
