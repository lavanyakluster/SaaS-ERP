import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  ChevronDown, 
  Check, 
  Plus, 
  Settings as SettingsIcon, 
  Users, 
  Crown,
  Search,
  X,
  Circle,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { ROUTES, buildOrganizationSettingsRoute, buildUsersSettingsRoute } from '@/lib/constants/routes';
import { useOrganizations, useSwitchOrganization, useDeleteOrganization } from '@/lib/hooks';
import type { Organization } from '@/lib/store/auth-store';

interface OrganizationSwitcherProps {
  onAddOrganization?: () => void;
  className?: string;
}

/**
 * Organization Switcher Component (Zoho-style)
 * 
 * Features:
 * - Shows current organization name in topbar
 * - Dropdown with all organizations list
 * - Active/Inactive status indicators
 * - Search/filter organizations
 * - Quick actions per organization
 * - Add new organization button
 * - ✅ Fetches organizations from API (no hard-coded values)
 */
export function OrganizationSwitcher({ onAddOrganization, className = '' }: OrganizationSwitcherProps) {
  const router = useRouter();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  
  const { 
    organizations, 
    selectedOrganization,
    organizationApiUrl, // ✅ Add this to get the current API URL
    setSelectedOrganization,
    setOrganizations,
  } = useAuthStore();

  // ✅ Fetch organizations from API
  const { data: apiOrganizations, isLoading, error, refetch } = useOrganizations();

  console.log('🔍 OrganizationSwitcher State:', {
    isLoading,
    hasError: !!error,
    errorMessage: error?.message,
    apiOrganizationsData: apiOrganizations,
    storeOrganizations: organizations,
    selectedOrganization,
  });

  // ✅ Switch organization mutation
  const switchOrganizationMutation = useSwitchOrganization({
    onSuccess: () => {
      // Close modal
      setIsOpen(false);
      setSearchQuery('');
      
      // Don't call router.refresh() - let the app naturally re-render with new org context
      console.log('✅ Organization switched successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to switch organization:', error);
      // Reset the auto-switch flag so user can try again
      hasAttemptedAutoSwitch.current = false;
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Track if we've attempted auto-switch to prevent loops
  const hasAttemptedAutoSwitch = useRef(false);

  // ✅ Sync API organizations to store
  useEffect(() => {
    if (Array.isArray(apiOrganizations)) {
      // Map API organizations to store format
      const mappedOrgs = apiOrganizations.map((org) => ({
        id: org.id,
        name: org.organizationName,
        displayName: org.organizationName,
        isActive: true, // API doesn't return status, assume active
        createdAt: new Date().toISOString(), // API doesn't return created date
      }));

      setOrganizations(mappedOrgs);

      console.log('✅ Organizations synced to store:', mappedOrgs.length);
    }
  }, [apiOrganizations, setOrganizations]);

  // ✅ Auto-switch to organization when needed (ONLY ONCE)
  useEffect(() => {
    // Prevent multiple auto-switches
    if (hasAttemptedAutoSwitch.current) return;
    
    // Don't auto-switch if already switching
    if (switchOrganizationMutation.isPending) return;
    
    // Wait for organizations to load
    if (isLoading) return;
    
    if (!organizations || organizations.length === 0) return;
    
    // ✅ Auto-switch if EITHER:
    // 1. No selected organization at all (first login)
    // 2. Selected organization exists BUT no organizationApiUrl (page refresh without API URL)
    const needsAutoSwitch = !selectedOrganization || !organizationApiUrl;
    
    if (needsAutoSwitch) {
      // If we have a selected org but no API URL, re-switch to the same org to get the URL
      const targetOrg = selectedOrganization || organizations[0];
      
      console.log('🔄 Auto-switching to organization:', {
        reason: !selectedOrganization ? 'No selected organization' : 'Missing organization API URL',
        targetOrg: targetOrg.displayName,
        hasApiUrl: !!organizationApiUrl,
      });
      
      // Mark that we've attempted auto-switch
      hasAttemptedAutoSwitch.current = true;
      
      // Trigger switch organization API
      switchOrganizationMutation.mutate(targetOrg.id);
    }
  }, [organizations, isLoading, selectedOrganization, organizationApiUrl, switchOrganizationMutation]);

  // Close modal when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Filter organizations based on search
  const filteredOrganizations = organizations?.filter(org => 
    org.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Active and inactive organizations
  const activeOrgs = filteredOrganizations.filter(org => org.isActive);
  const inactiveOrgs = filteredOrganizations.filter(org => !org.isActive);

  // Handle organization switch
  const handleSwitchOrganization = async (org: Organization) => {
    if (org.id === selectedOrganization?.id) {
      setIsOpen(false);
      return;
    }

    try {
      console.log('🔄 Switching to organization:', org.displayName);
      
      // ✅ Call switch organization API
      await switchOrganizationMutation.mutateAsync(org.id);
    } catch (error) {
      console.error('❌ Failed to switch organization:', error);
    }
  };

  // Current organization display
  const currentOrgName = selectedOrganization?.displayName || 'Select Organization';
  const hasOrganizations = organizations && organizations.length > 0;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
          ${isDark 
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white' 
            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
          }
          ${isOpen ? 'ring-2 ring-teal-500/20' : ''}
        `}
      >
        <div className={`p-1.5 rounded-lg ${
          isDark 
            ? 'bg-gradient-to-br from-teal-600 to-emerald-600' 
            : 'bg-gradient-to-br from-teal-500 to-emerald-500'
        }`}>
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm truncate max-w-[150px]">
          {currentOrgName}
        </span>
        {selectedOrganization?.isActive !== undefined && (
          <div className="flex-shrink-0">
            {selectedOrganization.isActive ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
          </div>
        )}
        {isLoading ? (
          <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
        ) : (
          <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Full Modal UI */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
             onClick={() => {
               setIsOpen(false);
               setSearchQuery('');
             }}>
          <div className={`
            w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden
            ${isDark ? 'bg-gray-800' : 'bg-white'}
          `}
               onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Manage Organizations
                </h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            
              {/* Search Input */}
              {hasOrganizations && (
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search organizations..."
                    className={`
                      w-full pl-10 pr-10 py-3 rounded-lg text-sm border transition-all
                      ${isDark 
                        ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500'
                      }
                      focus:outline-none focus:ring-2 focus:ring-teal-500/20
                    `}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Organizations List */}
            <div className="max-h-96 overflow-y-auto">
              {/* Loading State */}
              {isLoading && (
                <div className="p-8 text-center">
                  <Loader2 className={`w-12 h-12 mx-auto mb-3 animate-spin ${isDark ? 'text-teal-500' : 'text-teal-600'}`} />
                  <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Loading Organizations...
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    Please wait while we fetch your data
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                  <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Failed to Load Organizations
                  </p>
                  <p className={`text-xs mb-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    {error instanceof Error ? error.message : 'An error occurred'}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isDark
                        ? 'bg-teal-600 hover:bg-teal-500 text-white'
                        : 'bg-teal-500 hover:bg-teal-600 text-white'
                    }`}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* No Organizations */}
              {!isLoading && !error && !hasOrganizations && (
                <div className="p-8 text-center">
                  <Building2 className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    No Organizations Yet
                  </p>
                  <p className={`text-xs mb-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    Create your first organization to get started
                  </p>
                </div>
              )}

              {/* Organizations List */}
              {!isLoading && !error && hasOrganizations && (
                <>
                  {/* Active Organizations */}
                  {activeOrgs.length > 0 && (
                    <div className="p-2">
                      <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Active Organizations ({activeOrgs.length})
                      </div>
                      {activeOrgs.map((org) => (
                        <OrganizationItem
                          key={org.id}
                          organization={org}
                          isSelected={org.id === selectedOrganization?.id}
                          isDark={isDark}
                          onSelect={handleSwitchOrganization}
                          onSettings={() => {
                            setIsOpen(false);
                            router.push(buildOrganizationSettingsRoute(org.id));
                          }}
                          onUsers={() => {
                            setIsOpen(false);
                            router.push(buildUsersSettingsRoute(org.id));
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Inactive Organizations */}
                  {inactiveOrgs.length > 0 && (
                    <div className="p-2">
                      <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                        isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Inactive Organizations ({inactiveOrgs.length})
                      </div>
                      {inactiveOrgs.map((org) => (
                        <OrganizationItem
                          key={org.id}
                          organization={org}
                          isSelected={org.id === selectedOrganization?.id}
                          isDark={isDark}
                          onSelect={handleSwitchOrganization}
                          onSettings={() => {
                            setIsOpen(false);
                            router.push(buildOrganizationSettingsRoute(org.id));
                          }}
                          onUsers={() => {
                            setIsOpen(false);
                            router.push(buildUsersSettingsRoute(org.id));
                          }}
                          isInactive
                        />
                      ))}
                    </div>
                  )}

                  {/* No results */}
                  {filteredOrganizations.length === 0 && searchQuery && (
                    <div className="p-8 text-center">
                      <Search className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No organizations found for "{searchQuery}"
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer with Add Organization Button */}
            <div className={`p-3 border-t ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/tenant-setup');
                }}
                className={`
                  w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm
                  transition-all
                  ${isDark 
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white' 
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white'
                  }
                  shadow-lg hover:shadow-xl
                `}
              >
                <Plus className="w-4 h-4" />
                Add New Organization
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Individual Organization Item Component
 */
interface OrganizationItemProps {
  organization: Organization;
  isSelected: boolean;
  isDark: boolean;
  onSelect: (org: Organization) => void;
  onSettings: () => void;
  onUsers: () => void;
  isInactive?: boolean;
}

function OrganizationItem({ 
  organization, 
  isSelected, 
  isDark, 
  onSelect, 
  onSettings, 
  onUsers,
  isInactive = false 
}: OrganizationItemProps) {
  const [isSwitching, setIsSwitching] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { mutate: deleteOrg, isPending: isDeleting } = useDeleteOrganization();
  const { organizations, selectedOrganization, setSelectedOrganization } = useAuthStore();
  const router = useRouter();

  const handleSelect = async () => {
    if (isSelected || isSwitching) return;
    
    setIsSwitching(true);
    try {
      await onSelect(organization);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    console.log('🗑️ Deleting organization:', organization.displayName);
    
    deleteOrg(organization.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        
        // If deleted organization was selected, switch to another org
        if (isSelected && organizations.length > 1) {
          const nextOrg = organizations.find(org => org.id !== organization.id);
          if (nextOrg) {
            console.log('🔄 Switching to next available organization:', nextOrg.displayName);
            setSelectedOrganization(nextOrg);
          } else {
            // No organizations left, redirect to tenant setup
            router.push('/tenant-setup');
          }
        }
      },
    });
  };

  return (
    <div className={`
      relative group p-3 rounded-lg transition-all
      ${isSelected
        ? isDark
          ? 'bg-gradient-to-r from-teal-900/40 to-emerald-900/40 border-2 border-teal-700'
          : 'bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200'
        : isDark
          ? 'hover:bg-gray-700/50 border-2 border-transparent'
          : 'hover:bg-gray-100 border-2 border-transparent'
      }
      ${isInactive ? 'opacity-60' : ''}
      ${isSwitching ? 'opacity-50' : ''}
    `}>
      <div className="flex items-center gap-4">
        {/* Organization Icon & Info */}
        <button
          onClick={handleSelect}
          disabled={isSwitching || isSelected}
          className={`
            flex items-center gap-3 flex-1 min-w-0
            ${isSwitching || isSelected ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
            ${isSelected
              ? 'bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg'
              : isDark
                ? 'bg-gray-700'
                : 'bg-gray-200'
            }
          `}>
            {isSwitching ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Building2 className={`w-6 h-6 ${isSelected ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-sm truncate ${
                isSelected 
                  ? isDark ? 'text-teal-300' : 'text-teal-700'
                  : isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {organization.displayName}
              </span>
              {isSelected && (
                <Crown className="w-4 h-4 flex-shrink-0 text-yellow-500" />
              )}
              {isSwitching && (
                <span className="text-xs text-teal-500 font-medium">Switching...</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                ID: {organization.id.slice(0, 8)}...
              </span>
              {/* Status Badge */}
              {organization.isActive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  <XCircle className="w-3 h-3" />
                  Inactive
                </span>
              )}
            </div>
          </div>

          {/* Selected Check */}
          {isSelected && !isSwitching && (
            <Check className={`w-6 h-6 flex-shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
          )}
        </button>

        {/* Action Buttons - Always Visible */}
        {!isSelected && !isSwitching && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSettings();
              }}
              className={`
                p-2.5 rounded-lg transition-all
                ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600'}
                shadow-md hover:shadow-lg border
                ${isDark ? 'border-gray-600' : 'border-gray-200'}
              `}
              title="Organization Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUsers();
              }}
              className={`
                p-2.5 rounded-lg transition-all
                ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600'}
                shadow-md hover:shadow-lg border
                ${isDark ? 'border-gray-600' : 'border-gray-200'}
              `}
              title="Manage Users"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className={`
                p-2.5 rounded-lg transition-all
                ${isDark ? 'bg-red-900/30 hover:bg-red-800/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}
                shadow-md hover:shadow-lg border
                ${isDark ? 'border-red-800' : 'border-red-200'}
              `}
              title="Delete Organization"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
             onClick={(e) => {
               e.stopPropagation();
               setShowDeleteConfirm(false);
             }}>
          <div className={`
            ${isDark ? 'bg-gray-800' : 'bg-white'} 
            p-6 rounded-xl shadow-2xl max-w-md mx-4
          `}
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Delete Organization
              </h4>
            </div>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete <span className="font-semibold text-red-600 dark:text-red-400">"{organization.displayName}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }
                `}
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete();
                }}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                  ${isDark
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                  }
                `}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
