import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useThemeStore } from '@/lib/store/theme-store';
import { useGradientStore, GRADIENT_PRESETS } from '@/lib/store/gradient-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, User, ChevronDown, LogOut, Palette, Search, Settings, X, Check} from 'lucide-react';
import { AddOrganizationModal, OrganizationSwitcher } from '@/components/organization';
import { YearSelector } from '@/components/layout/YearSelector';
import { useCreateOrganization, useSwitchOrganization } from '@/lib/hooks';

// Memoize the search pages data (static data)
const SEARCH_PAGES = [
  { label: 'Dashboard - Overview', path: '/dashboard' },
  { label: 'Account Master - View All', path: '/masters/accounts' },
  { label: 'Group Master - New Entry', path: '/masters/groups' },
  { label: 'Branch Master - Settings', path: '/masters/branches' },
  { label: 'Profit Center - Manage', path: '/masters/profit-centers' },
  { label: 'Currency Master - Setup', path: '/masters/currencies' },
  { label: 'Receipt Voucher #INV-001', path: '/transactions/receipts' },
  { label: 'Payment Voucher #PAY-123', path: '/transactions/payments' },
  { label: 'Sales Report - November 2024', path: '/reports/ledger' },
  { label: 'Settings - System', path: '/settings' },
  { label: 'Billing - Subscription', path: '/billing' },
];

const TopNavBar = React.memo(function TopNavBar() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user, organizations, selectedOrganization, logout } = useAuthStore();
  const { activeGradient, setActiveGradient } = useGradientStore();
  
  // Hooks for organization operations
  const createOrganizationMutation = useCreateOrganization({
    onSuccess: (data) => {
      setShowAddOrgModal(false);
      // Organization will be auto-selected by the hook
    },
    onError: (error) => {
      console.error('Failed to create organization:', error);
    },
  });

  const [showOrganizationMenu, setShowOrganizationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showColorThemes, setShowColorThemes] = useState(false);
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{label: string, path: string}>>([]);
  const [showOrgActions, setShowOrgActions] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Refs for dropdowns
  const organizationMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const colorThemesRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = theme === 'dark';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (organizationMenuRef.current && !organizationMenuRef.current.contains(event.target as Node)) {
        setShowOrganizationMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (colorThemesRef.current && !colorThemesRef.current.contains(event.target as Node)) {
        setShowColorThemes(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search functionality - optimized
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      // Debounce search by 150ms
      searchTimeoutRef.current = setTimeout(() => {
        const query = searchQuery.toLowerCase();
        const filtered = SEARCH_PAGES.filter(page => 
          page.label.toLowerCase().includes(query)
        ).slice(0, 5);
        setSearchResults(filtered);
      }, 150);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleLogout = useCallback(async () => {
    setShowProfileMenu(false);
    
    // Clear auth state and redirect to login
    logout();
    router.push('/login');
  }, [logout]); // ✅ Removed 'router' from dependencies

  const handleSearchResultClick = useCallback((path: string) => {
    setSearchQuery('');
    setSearchFocused(false);
    router.push(path);
  }, []); // ✅ Removed 'router' from dependencies

  // Helper function for button classes
  const getButtonClasses = () => {
    return `p-2 rounded-xl border transition-all ${
      isDark
        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white'
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
    }`;
  };

  // Helper function for dropdown classes
  const getDropdownClasses = () => {
    return `absolute top-full right-0 mt-2 rounded-xl shadow-2xl border backdrop-blur-xl overflow-hidden ${
      isDark
        ? 'bg-gray-800/95 border-gray-700'
        : 'bg-white/95 border-gray-200'
    }`;
  };

  return (
    <>
      <nav 
        className={`h-16 border-b flex items-center justify-between px-6 relative z-40 ${
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Left Section - Logo & Context */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${activeGradient.from}, ${activeGradient.via}, ${activeGradient.to})`
              }}
            >
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className={`font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                SmartBook
              </h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                ERP System
              </p>
            </div>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-8" ref={searchRef}>
          <div className="relative">
            <div className={`relative flex items-center rounded-xl border transition-all ${
              searchFocused 
                ? isDark
                  ? 'border-teal-500 bg-gray-700 shadow-xl' 
                  : 'border-teal-500 bg-white shadow-xl'
                : isDark
                  ? 'border-gray-600 bg-gray-700'
                  : 'border-gray-300 bg-gray-50'
            }`}>
              <Search className={`w-5 h-5 absolute left-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search transactions, accounts, reports..."
                className={`w-full pl-12 pr-12 py-3 bg-transparent focus:outline-none text-sm font-medium ${
                  isDark
                    ? 'text-white placeholder-gray-400'
                    : 'text-gray-900 placeholder-gray-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-4 transition-colors ${
                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchFocused && searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border backdrop-blur-xl overflow-hidden ${
                isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
              }`}>
                <div className="p-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(result.path)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 opacity-50" />
                        <span className="text-sm">{result.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Color Themes */}
          <div className="relative" ref={colorThemesRef}>
            <button
              onClick={() => setShowColorThemes(!showColorThemes)}
              className={getButtonClasses()}
              title="Color Themes"
            >
              <Palette className="w-5 h-5" />
            </button>

            {showColorThemes && (
              <div className={`${getDropdownClasses()} w-64`}>
                <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <Palette className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Color Themes
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {GRADIENT_PRESETS.map((preset) => {
                      const isActive = preset.id === activeGradient.id;
                      return (
                        <div key={preset.id} className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveGradient(preset);
                              setShowColorThemes(false);
                            }}
                            className={`w-12 h-12 rounded-full transition-all relative ${
                              isActive ? 'ring-4 ring-offset-2' : 'hover:scale-110'
                            }`}
                            style={{
                              background: `linear-gradient(135deg, ${preset.from}, ${preset.via}, ${preset.to})`,
                              ...(isActive && {
                                boxShadow: `0 0 0 4px ${isDark ? '#1f2937' : '#ffffff'}, 0 0 0 8px ${preset.via}`
                              })
                            }}
                            title={preset.name}
                          >
                            {isActive && (
                              <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow-lg" />
                            )}
                          </button>
                          <span className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {preset.name.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <Link href="/settings" className={getButtonClasses()} title="Settings">
            <Settings className="w-5 h-5" />
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`${getButtonClasses()} relative`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-700"></span>
            </button>

            {showNotifications && (
              <div className={`${getDropdownClasses()} w-80`}>
                <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Notifications
                  </h3>
                </div>
                <div className="p-4">
                  <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No new notifications
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Organization Selector - New Zoho-style Switcher */}
          <OrganizationSwitcher
            onAddOrganization={() => setShowAddOrgModal(true)}
            className=""
          />

          {/* Year Selector - Shows when organization is selected */}
          <YearSelector />

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
              }`}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${activeGradient.from}, ${activeGradient.via})`
                }}
              >
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className={`font-semibold text-sm leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'User'}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user?.role || 'Admin'}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <div className={`${getDropdownClasses()} w-64`}>
                <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${activeGradient.from}, ${activeGradient.via}, ${activeGradient.to})`
                      }}
                    >
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user?.name}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      isDark
                        ? 'hover:bg-red-900/20 text-red-400'
                        : 'hover:bg-red-50 text-red-600'
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Add Organization Modal */}
      <AddOrganizationModal
        isOpen={showAddOrgModal}
        onClose={() => setShowAddOrgModal(false)}
        onSubmit={async (data) => {
          await createOrganizationMutation.mutateAsync({
            CompanyName: data.displayName,
            Industry: 'Other',
            Country: 'United Arab Emirates',
            Currency: 'AED',
            FiscalYearStart: 'January',
            CompanyPhone: 'N/A',
            CompanyEmail: `${data.name}@example.com`,
            Timezone: 'Asia/Dubai',
          });
        }}
      />
    </>
  );
});

export default TopNavBar;
