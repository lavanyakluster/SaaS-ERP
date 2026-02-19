'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, User, Shield, Clock, Loader2, KeyRound } from 'lucide-react';
import { ADDITIONAL_PERMISSIONS, OFF_DAY_OPTIONS } from '@/lib/constants/permissions';
import { PermissionsPanel } from './PermissionsPanel';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useRoles, useRoleById } from '@/lib/hooks/useRoles';
import { useUserById, useCreateUser, useUpdateUser } from '@/lib/hooks/useUsers';
import { parseAdditionalPermissionsFromApi, parseModulePermissionsFromApi, combineAllPermissions } from '@/lib/utils/permissions';
import { validatePasswordConfirmation, validatePasswordField } from '@/lib/utils/validation';
import { toast } from 'sonner';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  userId?: string | null; // If provided, this is edit mode
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  backDays: number;
  additionalPermissions: Record<string, boolean>;
  timeRestrictionEnabled: boolean;
  timeFrom: string;
  timeTo: string;
  offDay: string;
}

export function AddUserModal({ isOpen, onClose, isDark, userId }: AddUserModalProps) {
  // Fetch all roles for dropdown
  const { data: rolesData, isLoading: rolesLoading } = useRoles();

  // ✅ Fetch all branches

  // Fetch user details if in edit mode
  const { data: userData, isLoading: userLoading } = useUserById(userId ?? null);

  // Create user mutation
  const createUserMutation = useCreateUser();

  // Update user mutation
  const updateUserMutation = useUpdateUser();

  // Initialize with first role if available
  const initialRole = rolesData?.data?.[0]?.id || '';

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    backDays: 0,
    additionalPermissions: {},
    timeRestrictionEnabled: false,
    timeFrom: '09:00',
    timeTo: '18:00',
    offDay: 'none',
  });

  // Fetch selected role details only when permissions are missing from list data
  const selectedRoleFromList = rolesData?.data?.find((role) => role.id === formData.role);
  const shouldFetchRoleById = Boolean(formData.role) && !(selectedRoleFromList?.permissions?.length);
  const roleByIdQuery = useRoleById(shouldFetchRoleById ? formData.role : null);

  // Initialize permissions hook
  const { permissions, handlers } = usePermissions();

  // Update role when roles load (only if role is empty and not in edit mode)
  useEffect(() => {
    if (rolesData?.data && rolesData.data.length > 0 && !formData.role && !userId) {
      setFormData(prev => ({ ...prev, role: rolesData.data[0].id }));
    }
  }, [rolesData?.data, formData.role, userId]);

  // Reset form when switching from edit to create mode
  useEffect(() => {
    if (isOpen && !userId) {
      // Reset to default values when opening in create mode
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: rolesData?.data?.[0]?.id || '',
        backDays: 0,
        additionalPermissions: {},
        timeRestrictionEnabled: false,
        timeFrom: '09:00',
        timeTo: '18:00',
        offDay: 'none',
      });

      // Reset permissions and branches
      handlers.setModulePermissions({});
      handlers.setBranches([]);
    }
  }, [isOpen, userId, rolesData?.data]);

  // Load user data in edit mode
  useEffect(() => {
    if (userData && userId && isOpen) {
      console.log('📝 Loading user data for edit:', userData);
      // console.log('📝 Full user data object:', JSON.stringify(userData, null, 2));

      setFormData({
        name: userData.name ?? '',
        email: userData.email ?? '',
        password: '',
        confirmPassword: '',
        role: userData.roleId ?? '',
        backDays: userData.backDaysLimit ?? 0,
        additionalPermissions: parseAdditionalPermissionsFromApi(userData.permissions?.allow || []),
        timeRestrictionEnabled: userData.timeRestrictionEnabled ?? false,
        timeFrom: userData.timeFrom ?? '09:00',
        timeTo: userData.timeTo ?? '18:00',
        offDay: userData.offDay ?? 'none',
      });

      // Parse and set module permissions using common utility
      const modulePerms = parseModulePermissionsFromApi(userData.permissions?.allow || []);
      handlers.setModulePermissions(modulePerms);

      // Load branches (support legacy "Branches" while keeping unique branch codes)
      const mergedBranches = [
        ...(Array.isArray(userData.branches) ? userData.branches : []),
        ...(Array.isArray(userData.Branches) ? userData.Branches : []),
      ];
      const userBranches = Array.from(
        new Set(
          mergedBranches
            .filter((branch): branch is string => typeof branch === 'string')
            .map((branch) => branch.trim())
            .filter((branch) => branch.length > 0)
        )
      );
      console.log('🌿 User branches from API (raw):', userBranches);
      console.log('🌿 Type of branches:', typeof userBranches, Array.isArray(userBranches));
      console.log('🌿 Branches length:', userBranches.length);
      console.log('🌿 First branch (if exists):', userBranches[0]);

      if (userBranches.length > 0) {
        console.log('✅ Setting branches:', userBranches);
        handlers.setBranches(userBranches);
      } else {
        // Reset to empty if no branches
        console.log('⚠️ No branches found, resetting to empty array');
        handlers.setBranches([]);
      }

      // Log final state after setting
      setTimeout(() => {
        console.log('🔍 Final selected branches state:', permissions.selectedBranches);
      }, 100);
    }
  }, [userData, userId, isOpen]);

  // Load role permissions when role changes or modal opens
  useEffect(() => {
    if (!isOpen || userId) return;

    // Strategy 1: Load from rolesData list (if permissions are included - instant)
    const selectedRoleInList = rolesData?.data?.find(r => r.id === formData.role);
    if (selectedRoleInList?.permissions) {
      console.log('⚡ Loading permissions from roles list:', formData.role);
      const permissions = selectedRoleInList.permissions;
      setFormData(prev => ({
        ...prev,
        additionalPermissions: parseAdditionalPermissionsFromApi(permissions),
      }));
      handlers.setModulePermissions(parseModulePermissionsFromApi(permissions));
      return;
    }

    // Strategy 2: Load from singular role query (fallback/manual changes)
    if (roleByIdQuery.data) {
      console.log('🔍 Loading permissions from role query:', formData.role);
      const permissions = roleByIdQuery.data.permissions || [];
      setFormData(prev => ({
        ...prev,
        additionalPermissions: parseAdditionalPermissionsFromApi(permissions),
      }));
      handlers.setModulePermissions(parseModulePermissionsFromApi(permissions));
    }
  }, [roleByIdQuery.data, rolesData?.data, formData.role, userId, isOpen]);

  if (!isOpen) return null;

  const isEditMode = !!userId;
  const isLoadingUser = userLoading && isEditMode;
  const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending;

  const handleAdditionalPermissionToggle = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      additionalPermissions: {
        ...prev.additionalPermissions,
        [permId]: !prev.additionalPermissions[permId],
      },
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || typeof formData.name !== 'string' || !formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    if (!formData.email || typeof formData.email !== 'string' || !formData.email.trim()) {
      toast.error('Please enter an email');
      return;
    }

    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }

    const hasPasswordInput =
      formData.password.trim().length > 0 || formData.confirmPassword.trim().length > 0;

    if (!isEditMode || hasPasswordInput) {
      const passwordValidation = validatePasswordField(formData.password);
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.error || 'Please enter a valid password');
        return;
      }

      const confirmPasswordValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword);
      if (!confirmPasswordValidation.isValid) {
        toast.error(confirmPasswordValidation.error || 'Passwords do not match');
        return;
      }
    }

    // Collect all permissions using the common utility
    const allowPermissions = combineAllPermissions(
      permissions.modulePermissions,
      formData.additionalPermissions
    );
    const denyPermissions: string[] = [];
    const normalizedEmail = formData.email.trim().toLowerCase();
    const uniqueSelectedBranches = Array.from(new Set(permissions.selectedBranches));

    // Create or update the user via API
    try {
      let result;

      if (isEditMode) {
        result = await updateUserMutation.mutateAsync({
          userId: userId,
          userData: {
            name: formData.name,
            email: normalizedEmail,
            password: hasPasswordInput ? formData.password : undefined,
            roleid: formData.role,
            roleId: formData.role,
            permissions: {
              allow: allowPermissions,
              deny: denyPermissions,
            },
            branches: uniqueSelectedBranches,
            backDaysLimit: formData.backDays,
            timeRestrictionEnabled: formData.timeRestrictionEnabled,
            timeFrom: formData.timeRestrictionEnabled ? formData.timeFrom : undefined,
            timeTo: formData.timeRestrictionEnabled ? formData.timeTo : undefined,
            offDay: formData.offDay,
          }
        });

        if (result.status === 'exists') {
          toast.error(result.message || 'Email already exists for this tenant');
          return;
        }
      } else {
        result = await createUserMutation.mutateAsync({
          name: formData.name,
          email: normalizedEmail,
          password: formData.password,
          roleid: formData.role,
          roleId: formData.role,
          permissions: {
            allow: allowPermissions,
            deny: denyPermissions,
          },
          branches: uniqueSelectedBranches,
          backDaysLimit: formData.backDays,
          timeRestrictionEnabled: formData.timeRestrictionEnabled,
          timeFrom: formData.timeRestrictionEnabled ? formData.timeFrom : undefined,
          timeTo: formData.timeRestrictionEnabled ? formData.timeTo : undefined,
          offDay: formData.offDay,
          status: true,
        });

        console.log('📝 Create user response:', result);
      }

      // Check if the email already exists
      if (result.status === 'exists') {
        toast.error(result.message || 'Email already exists for this tenant');
        return;
      }

      toast.success(result.message || (isEditMode ? 'User updated successfully' : 'User created successfully'));
      onClose();
    } catch (error: any) {
      console.error('Failed to create/update user:', error);

      // Handle specific error messages
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.status === 'exists') {
        toast.error('Email already exists for this tenant');
      } else {
        toast.error(isEditMode ? 'Failed to update user. Please try again.' : 'Failed to create user. Please try again.');
      }
    }
  };

  const inputClassName = `w-full px-4 py-2.5 rounded-lg border ${isDark
    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`;

  const selectClassName = `w-full px-4 py-2.5 rounded-lg border ${isDark
    ? 'bg-gray-700/50 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900'
    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className={`w-full max-w-[1700px] rounded-xl sm:rounded-2xl shadow-2xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
          }`}
      >
        {/* Header */}
        <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b ${isDark
          ? 'border-gray-700 bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30'
          : 'border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50'
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center ${isDark
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-2 ring-blue-500/30'
                : 'bg-gradient-to-br from-blue-100 to-purple-100 ring-2 ring-blue-200'
                }`}>
                <User className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {isEditMode ? 'Update User' : 'Create New User'}
                </h2>
                <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} hidden sm:block`}>
                  {isEditMode ? 'Update user account details and permissions' : 'Configure user account with role-based permissions and access control'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all hover:rotate-90 ${isDark
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(98vh-180px)] sm:max-h-[calc(95vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
            {/* Left Column - User Details (3 columns on desktop, full width on mobile) */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-5">
              {/* Basic Information */}
              <div className={`rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
                }`}>
                <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                    <User className="w-4 h-4 text-blue-500" />
                    Basic Information
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={inputClassName}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`${inputClassName} pl-10`}
                        placeholder="john.doe@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      {isEditMode ? 'New Password (Optional)' : 'Create Password'}
                    </label>
                    <div className="relative">
                      <KeyRound className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className={`${inputClassName} pl-10`}
                        placeholder={isEditMode ? 'Leave blank to keep current password' : 'Create a strong password'}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      {isEditMode ? 'Confirm New Password' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <KeyRound className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={`${inputClassName} pl-10`}
                        placeholder={isEditMode ? 'Confirm new password' : 'Confirm password'}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      User Role
                    </label>
                    <div className="relative">
                      <Shield className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        className={`${selectClassName} pl-10`}
                        disabled={rolesLoading}
                      >
                        {rolesLoading ? (
                          <option value="">Loading roles...</option>
                        ) : rolesData?.data && rolesData.data.length > 0 ? (
                          rolesData.data.map(option => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))
                        ) : (
                          <option value="">No roles available</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className={`rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
                }`}>
                <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                    <Clock className="w-4 h-4 text-purple-500" />
                    Additional Settings
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Back Days Limit
                    </label>
                    <input
                      type="number"
                      value={formData.backDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, backDays: parseInt(e.target.value) || 0 }))}
                      className={inputClassName}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.timeRestrictionEnabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, timeRestrictionEnabled: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                        Enable Time Restrictions
                      </span>
                    </label>

                    {formData.timeRestrictionEnabled && (
                      <div className={`space-y-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                              From
                            </label>
                            <input
                              type="time"
                              value={formData.timeFrom}
                              onChange={(e) => setFormData(prev => ({ ...prev, timeFrom: e.target.value }))}
                              className={inputClassName}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                              To
                            </label>
                            <input
                              type="time"
                              value={formData.timeTo}
                              onChange={(e) => setFormData(prev => ({ ...prev, timeTo: e.target.value }))}
                              className={inputClassName}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            Off Day
                          </label>
                          <select
                            value={formData.offDay}
                            onChange={(e) => setFormData(prev => ({ ...prev, offDay: e.target.value }))}
                            className={selectClassName}
                          >
                            {OFF_DAY_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <label className={`block text-xs font-semibold mb-3 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Special Permissions
                    </label>
                    <div className="space-y-2.5">
                      {ADDITIONAL_PERMISSIONS.map(perm => (
                        <label key={perm.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.additionalPermissions[perm.id] || false}
                            onChange={() => handleAdditionalPermissionToggle(perm.id)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className={`text-sm ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'
                            }`}>
                            {perm.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions Panel - Shared Component */}
            <PermissionsPanel
              modulePermissions={permissions.modulePermissions}
              selectedBranches={permissions.selectedBranches}
              onModulePermissionToggle={handlers.handleModulePermissionToggle}
              onModuleSelectAll={handlers.handleModuleSelectAll}
              onSelectAllModules={handlers.handleSelectAllModules}
              onBranchToggle={handlers.handleBranchToggle}
              onSelectAllBranches={handlers.handleSelectAllBranches}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-semibold text-blue-500">{permissions.selectedBranches.length}</span> branches
            </div>
            <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-semibold text-emerald-500">
                {Object.values(permissions.modulePermissions).filter(p => p.add || p.view || p.edit || p.delete).length}
              </span> modules
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all text-sm sm:text-base ${isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              type="button"
              disabled={isLoadingUser || isSubmitting}
              className="flex-1 sm:flex-initial px-4 sm:px-8 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-lg sm:rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoadingUser || isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                isEditMode ? 'Update User' : 'Create User'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
