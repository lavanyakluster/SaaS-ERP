'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Shield, Mail, Edit, Trash2, MoreVertical, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AddUserModal } from '../modals/AddUserModal';
import { DeleteUserModal } from '../modals/DeleteUserModal';
import { useUsers, useDeleteUser } from '@/lib/hooks/useUsers';
import { toast } from 'sonner';

interface UserManagementSectionProps {
  isDark: boolean;
}

export function UserManagementSection({ isDark }: UserManagementSectionProps) {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Fetch users from API
  const { data: users = [], isLoading, isError, error } = useUsers();
  
  // Delete user mutation
  const deleteUserMutation = useDeleteUser();

  // Find the user being deleted
  const userToDelete = useMemo(() => {
    return users.find(u => u.userId === deletingUserId);
  }, [users, deletingUserId]);

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deletingUserId) return;

    try {
      await deleteUserMutation.mutateAsync(deletingUserId);
      toast.success('User deleted successfully');
      setDeletingUserId(null);
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user. Please try again.';
      toast.error(errorMessage);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      Admin: 'bg-purple-100 text-purple-800 border-purple-200',
      Manager: 'bg-blue-100 text-blue-800 border-blue-200',
      Accountant: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      User: 'bg-gray-100 text-gray-800 border-gray-200',
      Viewer: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[role as keyof typeof colors] || colors.User;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className={`rounded-xl border p-6 ${
          isDark 
            ? 'border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900' 
            : 'border-gray-200 bg-gradient-to-br from-white to-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                User Management
              </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage user accounts, roles, and permissions
              </p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Add New User
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              disabled={isLoading}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white border border-gray-200'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</div>
              <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {isLoading ? '...' : users.length}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white border border-gray-200'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active</div>
              <div className="text-2xl font-bold mt-1 text-emerald-600">
                {isLoading ? '...' : users.filter(u => u.status === 'Active').length}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white border border-gray-200'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Roles</div>
              <div className="text-2xl font-bold mt-1 text-purple-600">
                {isLoading ? '...' : new Set(users.map(u => u.roleName)).size}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white border border-gray-200'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Inactive</div>
              <div className="text-2xl font-bold mt-1 text-orange-600">
                {isLoading ? '...' : users.filter(u => u.status !== 'Active').length}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={`text-center py-12 rounded-xl border ${
            isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <Loader2 className={`w-12 h-12 mx-auto mb-4 animate-spin ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Loading users...
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Please wait while we fetch the user data
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className={`text-center py-12 rounded-xl border ${
            isDark ? 'border-red-900/50 bg-red-900/10' : 'border-red-200 bg-red-50'
          }`}>
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Failed to load users
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {error instanceof Error ? error.message : 'An error occurred while fetching users'}
            </p>
          </div>
        )}

        {/* Users Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredUsers.map(user => (
              <div
                key={user.userId}
                className={`rounded-xl border p-5 transition-all hover:shadow-lg ${
                  isDark
                    ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                } ${selectedUser === user.userId ? (isDark ? 'ring-2 ring-emerald-500' : 'ring-2 ring-emerald-500') : ''}`}
                onClick={() => setSelectedUser(user.userId)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                      isDark ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400' : 'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                      </h3>
                      <div className={`flex items-center gap-1.5 text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Mail className="w-3.5 h-3.5" />
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingUserId(user.userId);
                        setShowAddUserModal(true);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-emerald-400' : 'hover:bg-gray-100 text-gray-600 hover:text-emerald-600'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingUserId(user.userId);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-600 hover:text-red-600'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${getRoleBadgeColor(user.roleName)}`}>
                    <Shield className="w-3.5 h-3.5" />
                    {user.roleName}
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    user.status === 'Active' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {user.status === 'Active' && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />}
                    {user.status}
                  </div>
                </div>

                <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div>
                    <span className="font-medium">{user.permissions.length}</span> permissions
                  </div>
                  <div>
                    User ID: <span className="font-mono text-xs">{user.userId.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && filteredUsers.length === 0 && (
          <div className={`text-center py-12 rounded-xl border ${
            isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <Search className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No users found
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => {
          setShowAddUserModal(false);
          setEditingUserId(null); // Clear editing state when closing
        }}
        isDark={isDark}
        userId={editingUserId}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={deletingUserId !== null}
        onClose={() => setDeletingUserId(null)}
        isDark={isDark}
        userId={deletingUserId}
        userName={userToDelete?.name}
        userEmail={userToDelete?.email}
        isDeleting={deleteUserMutation.isPending}
        onDelete={handleDeleteUser}
      />
    </>
  );
}