'use client';

/**
 * Settings Page - Clean Refactored Version
 * ==========================================
 * This page routes to separate section components:
 * - Organization Profile: /components/settings/sections/OrganizationProfile.tsx
 * - User Management: /components/settings/sections/UserManagementSection.tsx
 * - Roles & Permissions: /components/settings/sections/RolesPermissionsSection.tsx
 * - Billing Subscription: /components/settings/sections/BillingSubscriptionSection.tsx
 * - Billing Information: /components/settings/sections/BillingInformationSection.tsx
 */

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSettings } from '@/lib/contexts/settings-context';
import { useTheme } from '@/lib/store/theme-store';
import { OrganizationProfile } from '@/components/settings/sections/OrganizationProfile';
import { UserManagementSection } from '@/components/settings/sections/UserManagementSection';
import { RolesPermissionsSection } from '@/components/settings/sections/RolesPermissionsSection';
import { BillingSubscriptionSection } from '@/components/settings/sections/BillingSubscriptionSection';
import { BillingInformationSection } from '@/components/settings/sections/BillingInformationSection';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const { activeSection, setActiveSection } = useSettings();
  const { isDark } = useTheme();

  // ✅ Handle URL query parameter for section
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      // Map URL section parameter to internal section ID
      const sectionMap: Record<string, string> = {
        'organization': 'org-profile',
        'users': 'users',
        'roles': 'roles',
        'subscription': 'subscription',
        'billing': 'billing-info',
      };
      
      const mappedSection = sectionMap[sectionParam] || sectionParam;
      
      console.log('🔗 Setting active section from URL:', {
        urlParam: sectionParam,
        mappedSection,
      });
      
      setActiveSection(mappedSection);
    }
  }, [searchParams, setActiveSection]);

  // Render content based on active section
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'org-profile':
        return <OrganizationProfile />;
      case 'users':
        return <UserManagementSection isDark={isDark} />;
      case 'roles':
        return <RolesPermissionsSection isDark={isDark} />;
      case 'subscription':
        return <BillingSubscriptionSection isDark={isDark} />;
      case 'billing-info':
        return <BillingInformationSection isDark={isDark} />;
      default:
        return <ComingSoonContent isDark={isDark} sectionId={activeSection} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {renderSectionContent()}
    </div>
  );
}

function ComingSoonContent({ isDark, sectionId }: { isDark: boolean; sectionId: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <svg className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Coming Soon
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          This section ({sectionId}) is under development
        </p>
      </div>
    </div>
  );
}
