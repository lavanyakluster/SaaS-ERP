'use client';

import { useState, useEffect } from 'react';
import { X, Shield, Clock, Loader2 } from 'lucide-react';
import { ADDITIONAL_PERMISSIONS, OFF_DAY_OPTIONS } from '@/config/permissions';
import { PermissionsPanel } from './PermissionsPanel';
import { usePermissions } from '@/hooks/usePermissions';
import { useCreateRole, useUpdateRole, useRoleById } from '@/lib/hooks/useRoles';
import { useBranches } from '@/lib/hooks';
import { combineAllPermissions, parseModulePermissionsFromApi, parseAdditionalPermissionsFromApi } from '@/lib/utils/permissions';
import { toast } from 'sonner';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  editRoleId?: string | null; // Change to roleId instead of full role object
}

interface RoleFormData {
  roleName: string;
  description: string;
  additionalPermissions: Record<string, boolean>;
  backDays: number;
  timeRestrictionEnabled: boolean;
  timeFrom: string;
  timeTo: string;
  offDay: string;
}

export function CreateRoleModal({ isOpen, onClose, isDark, editRoleId }: CreateRoleModalProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    roleName: '',
    description: '',
    additionalPermissions: {},
    backDays: 0,
    timeRestrictionEnabled: false,
    timeFrom: '09:00',
    timeTo: '18:00',
    offDay: 'none',
  });

  // Fetch role details if editing
  const roleByIdQuery = useRoleById(editRoleId || null);
  
  // Debug logs
  useEffect(() => {
    console.log('🎯 CreateRoleModal - editRoleId:', editRoleId);
    console.log('🎯 CreateRoleModal - roleByIdQuery:', {
      isLoading: roleByIdQuery.isLoading,
      isError: roleByIdQuery.isError,
      data: roleByIdQuery.data,
    });
  }, [editRoleId, roleByIdQuery.isLoading, roleByIdQuery.data]);
  
  // Initialize permissions with parsed data if editing
  const initialModulePermissions = roleByIdQuery.data 
    ? parseModulePermissionsFromApi(roleByIdQuery.data.permissions)
    : {};

  const { permissions, handlers } = usePermissions({
    modulePermissions: initialModulePermissions,
  });
  
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  // Populate form when editing
  useEffect(() => {
    if (roleByIdQuery.data && editRoleId) {
      const role = roleByIdQuery.data;
      
      // Parse permissions from API
      const parsedAdditionalPermissions = parseAdditionalPermissionsFromApi(role.permissions);
      
      // Update form data
      setFormData({
        roleName: role.name,
        description: role.description,
        additionalPermissions: parsedAdditionalPermissions,
        backDays: 0,
        timeRestrictionEnabled: false,
        timeFrom: '09:00',
        timeTo: '18:00',
        offDay: 'none',
      });
    } else if (!editRoleId) {
      // Reset form when creating new
      setFormData({
        roleName: '',
        description: '',
        additionalPermissions: {},
        backDays: 0,
        timeRestrictionEnabled: false,
        timeFrom: '09:00',
        timeTo: '18:00',
        offDay: 'none',
      });
    }
  }, [roleByIdQuery.data, editRoleId]);

  if (!isOpen) return null;

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
    if (!formData.roleName.trim()) {
      toast.error('Please enter a role name');
      return;
    }
    
    try {
      // Combine all permissions
      const allPermissions = combineAllPermissions(
        permissions.modulePermissions,
        formData.additionalPermissions
      );

      // Prepare API payload
      const payload = {
        Role: formData.roleName.trim(),
        Description: formData.description.trim(),
        Permissions: allPermissions,
      };

      console.log(editRoleId ? 'Updating role:' : 'Creating role:', payload);

      // Call API using mutation
      if (editRoleId) {
        await updateRoleMutation.mutateAsync({ roleId: editRoleId, data: payload });
      } else {
        await createRoleMutation.mutateAsync(payload);
      }
      
      // Close modal on success (toast handled by hook)
      onClose();
    } catch (error) {
      // Error toast handled by hook
      console.error('Error creating/updating role:', error);
    }
  };

  const inputClassName = `w-full px-4 py-2.5 rounded-lg border ${
    isDark
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`;

  const selectClassName = `w-full px-4 py-2.5 rounded-lg border ${
    isDark
      ? 'bg-gray-700/50 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className={`w-full max-w-[1700px] rounded-xl sm:rounded-2xl shadow-2xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden ${
          isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        }`}
      >
        {/* Header */}
        <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b ${
          isDark 
            ? 'border-gray-700 bg-gradient-to-r from-emerald-900/30 via-teal-900/30 to-cyan-900/30' 
            : 'border-gray-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center ${
                isDark 
                  ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-2 ring-emerald-500/30' 
                  : 'bg-gradient-to-br from-emerald-100 to-cyan-100 ring-2 ring-emerald-200'
              }`}>
                <Shield className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div>
                <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editRoleId ? 'Edit Role' : 'Create New Role'}
                </h2>
                <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} hidden sm:block`}>
                  {editRoleId ? 'Update role permissions and access control settings' : 'Define role permissions and access control settings'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all hover:rotate-90 ${
                isDark 
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
            {/* Left Column - Role Details (3 columns on desktop, full width on mobile) */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-5">
              {/* Basic Information */}
              <div className={`rounded-lg sm:rounded-xl border ${
                isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
              }`}>
                <div className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                    Basic Information
                  </h3>
                </div>
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 sm:mb-2 uppercase tracking-wide ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Role Name
                    </label>
                    <input
                      type="text"
                      value={formData.roleName}
                      onChange={(e) => setFormData(prev => ({ ...prev, roleName: e.target.value }))}
                      className={inputClassName}
                      placeholder="e.g., Sales Manager"
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 sm:mb-2 uppercase tracking-wide ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className={`${inputClassName} min-h-[80px] sm:min-h-[100px] resize-none`}
                      placeholder="Describe the role responsibilities..."
                    />
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className={`rounded-lg sm:rounded-xl border ${
                isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
              }`}>
                <div className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                    Additional Settings
                  </h3>
                </div>
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 sm:mb-2 uppercase tracking-wide ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
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

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.timeRestrictionEnabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, timeRestrictionEnabled: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-xs sm:text-sm font-medium ${
                        isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        Enable Time Restrictions
                      </span>
                    </label>

                    {formData.timeRestrictionEnabled && (
                      <div className={`space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1 sm:mb-1.5 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
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
                            <label className={`block text-xs font-medium mb-1 sm:mb-1.5 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
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
                          <label className={`block text-xs font-medium mb-1 sm:mb-1.5 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
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

                  <div className={`pt-2 sm:pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <label className={`block text-xs font-semibold mb-2 sm:mb-3 uppercase tracking-wide ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Special Permissions
                    </label>
                    <div className="space-y-2 sm:space-y-2.5">
                      {ADDITIONAL_PERMISSIONS.map(perm => (
                        <label key={perm.id} className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.additionalPermissions[perm.id] || false}
                            onChange={() => handleAdditionalPermissionToggle(perm.id)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className={`text-xs sm:text-sm ${
                            isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'
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
        <div className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-semibold text-blue-500">{permissions.selectedBranches.length}</span> branches
            </div>
            <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-semibold text-purple-500">{permissions.selectedLedgers.length}</span> ledgers
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
              disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
              className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all text-sm sm:text-base ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:opacity-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
              className="flex-1 sm:flex-initial px-4 sm:px-8 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white rounded-lg sm:rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {createRoleMutation.isPending || updateRoleMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  {editRoleId ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editRoleId ? 'Update Role' : 'Create Role'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
