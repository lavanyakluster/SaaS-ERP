'use client';

import { useState } from 'react';
import { Search, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================
// TYPES
// ============================================

interface SettingsTopNavProps {
  title: string;
  description: string;
  isDark: boolean;
  actionButton?: React.ReactNode;
  showBackButton?: boolean;
  backUrl?: string;
  onBack?: () => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  showCloseButton?: boolean;
  closeUrl?: string;
  onClose?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function SettingsTopNav({
  title,
  description,
  isDark,
  actionButton,
  showBackButton = false,
  backUrl,
  onBack,
  showSearch = false,
  searchPlaceholder = 'Search...',
  onSearchChange,
  showCloseButton = false,
  closeUrl = '/dashboard',
  onClose
}: SettingsTopNavProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (closeUrl) {
      router.push(closeUrl);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <div className={`border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="px-8 py-6">
        <div className="flex items-center justify-between gap-6">
          {/* Left Section: Back Button + Title */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {showBackButton && (
              <button
                onClick={handleBack}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex-1 min-w-0">
              <h1 className={`text-2xl font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h1>
              <p className={`text-sm mt-1 truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {description}
              </p>
            </div>
          </div>

          {/* Center Section: Search Bar (if enabled) */}
          {showSearch && (
            <div className="flex-1 max-w-md">
              <div className={`relative ${isSearchFocused ? 'ring-2 ring-emerald-500 rounded-lg' : ''}`}>
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder={searchPlaceholder}
                  className={`w-full pl-9 pr-9 py-2 rounded-lg text-sm transition-colors ${
                    isDark
                      ? 'bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
                      : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                  } focus:outline-none`}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                      isDark
                        ? 'hover:bg-gray-700 text-gray-500 hover:text-gray-400'
                        : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right Section: Action Button + Close Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {actionButton && (
              <div>
                {actionButton}
              </div>
            )}
            
            {showCloseButton && (
              <button
                onClick={handleClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}