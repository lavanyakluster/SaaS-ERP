'use client';

import { useState } from 'react';
import { Shield, Search, Edit, Trash2, Loader2, AlertCircle, Users, Building2 } from 'lucide-react';
import { CreateRoleModal } from '../modals/CreateRoleModal';
import { useRoles, useDeleteRole } from '@/lib/hooks/useRoles';
import { formatDistanceToNow } from 'date-fns';

interface RolesPermissionsSectionProps {
  isDark: boolean;
}

export function RolesPermissionsSection({ isDark }: RolesPermissionsSectionProps) {
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: rolesData, isLoading, isError, error } = useRoles();
  const deleteRoleMutation = useDeleteRole();

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the role "${roleName}"?`);
    if (!confirmed) return;

    deleteRoleMutation.mutate(roleId);
  };

  // Filter roles based on search query
  const filteredRoles = rolesData?.data?.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Roles & Permissions
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage roles and their permissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateRoleModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Create Role
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className={`w-8 h-8 animate-spin mx-auto mb-2 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading roles...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className={`rounded-xl border p-6 ${
            isDark
              ? 'border-red-900/50 bg-red-900/20'
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-3">
              <AlertCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-900'}`}>
                  Failed to load roles
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                  {(error as any)?.message || 'An error occurred while fetching roles'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredRoles.length === 0 && (
          <div className={`rounded-xl border p-12 text-center ${
            isDark
              ? 'border-gray-700 bg-gray-800/50'
              : 'border-gray-200 bg-gray-50'
          }`}>
            <Shield className={`w-12 h-12 mx-auto mb-4 ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {searchQuery ? 'No roles found' : 'No roles yet'}
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Create your first role to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateRoleModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Role
              </button>
            )}
          </div>
        )}

        {/* Roles Grid */}
        {!isLoading && !isError && filteredRoles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map(role => (
              <div
                key={role.id}
                className={`rounded-xl border p-6 ${
                  isDark
                    ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                } transition-colors`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditRoleId(role.id);
                        setShowCreateRoleModal(true);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                      title="Edit role"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id, role.name)}
                      disabled={deleteRoleMutation.isPending}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                        isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'
                      }`}
                      title="Delete role"
                    >
                      {deleteRoleMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {role.name}
                </h3>
                <p className={`text-sm mb-4 min-h-[40px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {role.description || 'No description provided'}
                </p>

                <div className="space-y-2 mb-4">
                  <div className={`flex items-center gap-2 text-xs ${
                    isDark ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    <Shield className="w-3.5 h-3.5" />
                    <span>{role.permissions.length} permissions</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    isDark ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    <span>
                      Created{' '}
                      {(() => {
                        const date = new Date(role.created_At);
                        return !role.created_At || isNaN(date.getTime())
                          ? 'unknown'
                          : formatDistanceToNow(date, { addSuffix: true });
                      })()}
                    </span>
                  </div>
                </div>

                {/* Permissions Preview */}
                {role.permissions.length > 0 && (
                  <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-xs font-medium mb-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Permissions:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((perm, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded ${
                            isDark
                              ? 'bg-emerald-900/30 text-emerald-400'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {perm}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            isDark
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!isLoading && !isError && rolesData?.data && rolesData.data.length > 0 && (
          <div className={`rounded-xl border p-4 ${
            isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between text-sm">
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Showing <span className="font-semibold text-emerald-500">{filteredRoles.length}</span> of{' '}
                <span className="font-semibold">{rolesData.data.length}</span> roles
              </div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Total permissions:{' '}
                <span className="font-semibold text-blue-500">
                  {rolesData.data.reduce((acc, role) => acc + role.permissions.length, 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      <CreateRoleModal
        key={editRoleId || 'new'} // Force re-mount when editRoleId changes
        isOpen={showCreateRoleModal}
        onClose={() => {
          setShowCreateRoleModal(false);
          setEditRoleId(null); // Reset edit mode
        }}
        isDark={isDark}
        editRoleId={editRoleId}
      />
    </>
  );
}