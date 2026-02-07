/**
 * Organization Profile Section
 * Basic organization information settings
 * ✅ Fetches organization details from API (no hard-coded values)
 */

'use client';

import { memo, useState, useEffect } from 'react';
import { SettingsCard } from '../SettingsCard';
import { FormField, TextAreaField } from '../FormField';
import { ActionButton } from '../ActionButton';
import { Building2, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOrganizationById, useUpdateOrganization } from '@/lib/hooks';

export const OrganizationProfile = memo(function OrganizationProfile() {
  // ✅ Get selected organization from auth store
  const selectedOrganization = useAuthStore((state) => state.selectedOrganization);
  
  // ✅ Fetch organization details from API
  const { data: orgData, isLoading, error, refetch } = useOrganizationById(
    selectedOrganization?.id
  );

  // ✅ Update organization hook
  const { mutate: updateOrg, isPending: isUpdating } = useUpdateOrganization();

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [timezone, setTimezone] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // ✅ Update form fields when API data is loaded
  useEffect(() => {
    if (orgData?.data) {
      const org = orgData.data;
      setCompanyName(org.organizationName || '');
      setEmail(org.email || '');
      setPhone(org.phoneNumber || '');
      setIndustry(org.industry || '');
      setCountry(org.country || '');
      setCurrency(org.currency || '');
      setTimezone(org.timezone || '');
      setFiscalYear(org.finacialYear || '');
      setStatus(org.status || 'ACTIVE');
      
      console.log('✅ Organization data loaded:', org.organizationName);
    }
  }, [orgData]);

  const handleUpdate = async () => {
    if (!selectedOrganization?.id) {
      console.error('❌ No organization selected');
      return;
    }

    console.log('🔄 Updating organization:', {
      id: selectedOrganization.id,
      name: companyName,
    });

    updateOrg({
      organizationId: selectedOrganization.id,
      data: {
        CompanyName: companyName,
        Industry: industry,
        Country: country,
        Currency: currency,
        FiscalYearStart: fiscalYear,
        CompanyPhone: phone,
        CompanyEmail: email,
        Timezone: timezone,
      },
    });
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <SettingsCard
        title="Organization Profile"
        description="Manage your organization's basic information"
        icon={Building2}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading organization details...
          </span>
        </div>
      </SettingsCard>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <SettingsCard
        title="Organization Profile"
        description="Manage your organization's basic information"
        icon={Building2}
      >
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Failed to load organization details
          </p>
          <ActionButton
            variant="secondary"
            onClick={() => refetch()}
          >
            Retry
          </ActionButton>
        </div>
      </SettingsCard>
    );
  }

  // ✅ No organization selected
  if (!selectedOrganization) {
    return (
      <SettingsCard
        title="Organization Profile"
        description="Manage your organization's basic information"
        icon={Building2}
      >
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No organization selected
          </p>
        </div>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard
      title="Organization Profile"
      description="Manage your organization's basic information"
      icon={Building2}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name"
            required
          />
          <FormField
            label="Industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g., Healthcare, Technology"
            required
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@company.com"
          />
          <FormField
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+971 4 XXX XXXX"
          />
        </div>

        {/* Regional Settings */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g., United Arab Emirates"
            required
          />
          <FormField
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="e.g., AED, USD"
            required
          />
        </div>

        {/* Business Settings */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            label="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="e.g., Asia/Dubai"
            required
          />
          <FormField
            label="Fiscal Year Start"
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            placeholder="e.g., January, April"
            required
          />
        </div>

        {/* Status */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <ActionButton
            variant="primary"
            icon={Save}
            onClick={handleUpdate}
            loading={isUpdating}
          >
            Save Changes
          </ActionButton>
        </div>
      </div>
    </SettingsCard>
  );
});