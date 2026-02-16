'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Globe, Calendar, ArrowRight, Check, Sparkles, DollarSign, Phone, Mail } from 'lucide-react';
import { Logo } from '@/components/common';
import { useTheme } from '@/lib/store/theme-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { setAuthStatusCookie } from '@/lib/utils/auth-helpers';
import { validateRequired, isValidEmail, isValidPhone } from '@/lib/utils/validation';
import { ROUTES, INDUSTRIES, GCC_COUNTRIES, CURRENCIES, FISCAL_YEAR_STARTS } from '@/lib/constants/app';
import { useCreateOrganization } from '@/lib/hooks';

// ============================================================================
// TYPES
// ============================================================================

interface TenantSetupData {
  companyName: string;
  industry: string;
  country: string;
  currency: string;
  fiscalYearStart: string;
  timezone: string;
  companyPhone: string;
  companyEmail: string;
}

interface FormErrors {
  companyName?: string;
  industry?: string;
  country?: string;
  currency?: string;
  companyPhone?: string;
  companyEmail?: string;
  general?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FISCAL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

const INDUSTRY_OPTIONS = [
  { value: 'accounting', label: 'Accounting & Finance', icon: '💰' },
  { value: 'construction', label: 'Construction & Real Estate', icon: '🏗️' },
  { value: 'consulting', label: 'Consulting Services', icon: '💼' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'hospitality', label: 'Hospitality & Tourism', icon: '🏨' },
  { value: 'it', label: 'IT & Technology', icon: '💻' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'retail', label: 'Retail & E-commerce', icon: '🛒' },
  { value: 'wholesale', label: 'Wholesale & Distribution', icon: '📦' },
  { value: 'other', label: 'Other', icon: '🏢' },
] as const;

const COUNTRY_OPTIONS = [
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', tz: 'Asia/Dubai', currency: 'AED' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', tz: 'Asia/Riyadh', currency: 'SAR' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', tz: 'Asia/Qatar', currency: 'QAR' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', tz: 'Asia/Kuwait', currency: 'KWD' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', tz: 'Asia/Bahrain', currency: 'BHD' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', tz: 'Asia/Muscat', currency: 'OMR' },
  { code: 'OTHER', name: 'Other', flag: '🌍', tz: 'UTC', currency: 'USD' },
] as const;

// ============================================================================
// COMPONENT
// ============================================================================

function TenantSetupContent() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // Form state
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('AE');
  const [currency, setCurrency] = useState('AED');
  const [fiscalYearStart, setFiscalYearStart] = useState('January');
  const [timezone, setTimezone] = useState('Asia/Dubai');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Tenant creation mutation
  const tenantMutation = useCreateOrganization({
    onSuccess: async (response) => {
      console.log('🎉 Organization created successfully!');
      console.log('📋 Response:', response);
      
      // Check if backend returned new tokens
      const hasNewTokens = response.success && response.data?.tokens;
      
      if (!hasNewTokens) {
        console.log('⚠️ Backend did not return new tokens - refreshing manually...');
        
        // Get current refresh token
        const currentRefreshToken = useAuthStore.getState().tokens?.refreshToken;
        
        if (currentRefreshToken) {
          try {
            // Refresh tokens to get new token with organizationId
            const { refreshToken } = await import('@/lib/api/auth.api');
            const refreshResponse = await refreshToken({ refreshToken: currentRefreshToken });
            
            console.log('🔄 Token refreshed successfully!');
            console.log('🎫 New token preview:', refreshResponse.accessToken.substring(0, 50) + '...');
            
            // Update tokens in store
            useAuthStore.getState().setTokens(
              refreshResponse.accessToken,
              refreshResponse.refreshToken,
              refreshResponse.expiresIn
            );
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            // Continue anyway - user can still access the app
          }
        }
      } else {
        console.log('✅ New tokens received from backend');
      }
      
      // Store organization ID and details in auth store only
      if (typeof window !== 'undefined' && response.data) {
        const { organization, user_context } = response.data;
        
        if (organization?.id && organization?.name) {
          console.log('✅ Organization setup complete:', organization.name);
          console.log('👤 User role:', user_context?.role?.name);
          console.log('🔐 Permissions:', user_context?.permissions);
        }
      }

      // Set authenticated status
      const { setStatus, setSelectedOrganization, setSelectedYear, setSelectedBranch } = useAuthStore.getState();
      
      // Map API organization to Store organization
      if (response.data?.organization) {
        const apiOrg = response.data.organization;
        setSelectedOrganization({
          id: apiOrg.id,
          name: apiOrg.name,
          displayName: apiOrg.name,
          isActive: apiOrg.status === 'ACTIVE',
          createdAt: apiOrg.created_at
        });
      }
      
      setSelectedYear('2024-2025');
      setSelectedBranch('Main Office');
      setStatus('authenticated');

      // Set auth status cookie
      setAuthStatusCookie('authenticated');

      // Redirect to dashboard
      console.log('🚀 Redirecting to dashboard...');
      router.push(ROUTES.dashboard);
    },
    onError: (error: any) => {
      console.error('❌ Organization creation error:', error);
      const errorMessage = error?.response?.data?.message || 'Setup failed. Please try again.';
      setErrors({ general: errorMessage });
    },
  });

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-set timezone and currency based on country
  useEffect(() => {
    const selectedCountry = COUNTRY_OPTIONS.find(c => c.code === country);
    if (selectedCountry) {
      setTimezone(selectedCountry.tz);
      setCurrency(selectedCountry.currency);
    }
  }, [country]);

  // Validate Step 1
  const validateStep1 = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    const nameValidation = validateRequired(companyName.trim());
    if (!nameValidation.isValid) {
      newErrors.companyName = 'Company name is required';
    } else if (companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }

    const industryValidation = validateRequired(industry);
    if (!industryValidation.isValid) {
      newErrors.industry = 'Please select an industry';
    }

    return newErrors;
  }, [companyName, industry]);

  // Validate Step 2
  const validateStep2 = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    if (companyPhone && !isValidPhone(companyPhone)) {
      newErrors.companyPhone = 'Please enter a valid phone number';
    }

    if (companyEmail && !isValidEmail(companyEmail)) {
      newErrors.companyEmail = 'Please enter a valid email address';
    }

    return newErrors;
  }, [companyPhone, companyEmail]);

  // Handle next step
  const handleNext = useCallback(() => {
    const newErrors = validateStep1();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
  }, [validateStep1]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (currentStep === 1) {
      handleNext();
      return;
    }

    const newErrors = validateStep2();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      // Prepare organization creation data with PascalCase field names
      // No UserId needed - backend uses JWT token to identify user
      const tenantData = {
        CompanyName: companyName,
        Industry: INDUSTRY_OPTIONS.find(i => i.value === industry)?.label || industry,
        Country: COUNTRY_OPTIONS.find(c => c.code === country)?.name || country,
        Currency: currency,
        FiscalYearStart: fiscalYearStart,
        CompanyPhone: companyPhone,
        CompanyEmail: companyEmail,
        Timezone: timezone,
      };

      // Debug log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🏢 Creating organization with data:', tenantData);
        
        // Check if token exists
        const currentToken = useAuthStore.getState().getAccessToken();
        console.log('🔑 Current token exists:', !!currentToken);
        console.log('🔑 Token type:', typeof currentToken);
        if (currentToken) {
          console.log('🔑 Token preview:', currentToken.substring(0, 50) + '...');
        }
      }

      // Create organization
      tenantMutation.mutate(tenantData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Setup failed. Please try again.';
      setErrors({ general: errorMessage });
    }
  }, [currentStep, handleNext, validateStep2, companyName, industry, country, currency, fiscalYearStart, timezone, companyPhone, companyEmail, tenantMutation]);

  // Handle back
  const handleBack = useCallback(() => {
    setCurrentStep(1);
    setErrors({});
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    }`}>
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo
            size="lg"
            variant="gradient"
            showText={true}
            title="SmartBook ERP"
            subtitle="Let's set up your workspace"
            theme={theme}
          />
        </div>

        {/* Main Card */}
        <div className={`rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}>
          {/* Progress Header */}
          <div className={`p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentStep === 1 ? 'Company Information' : 'Additional Details'}
                </h2>
                <p className={`text-sm mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Step {currentStep} of 2
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                isDark 
                  ? 'bg-emerald-900/30 text-emerald-400' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {currentStep === 1 ? '50%' : '100%'} Complete
              </div>
            </div>

            {/* Progress Bar */}
            <div className={`h-2 rounded-full overflow-hidden ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                style={{ width: currentStep === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-5">
                {/* Company Name */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Company Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 className={`w-5 h-5 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter your company name"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all ${
                        isDark
                          ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                      } focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${
                        errors.companyName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
                      }`}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.companyName}</p>
                  )}
                </div>

                {/* Industry */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Industry *
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isDark
                        ? 'bg-gray-900 border-gray-700 text-white focus:border-emerald-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                    } focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${
                      errors.industry ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
                    }`}
                  >
                    <option value="">Select your industry</option>
                    {INDUSTRY_OPTIONS.map((ind) => (
                      <option key={ind.value} value={ind.value}>
                        {ind.icon} {ind.label}
                      </option>
                    ))}
                  </select>
                  {errors.industry && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.industry}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Country *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isDark
                        ? 'bg-gray-900 border-gray-700 text-white focus:border-emerald-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                    } focus:outline-none focus:ring-4 focus:ring-emerald-500/10`}
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Currency */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Currency *
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isDark
                        ? 'bg-gray-900 border-gray-700 text-white focus:border-emerald-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                    } focus:outline-none focus:ring-4 focus:ring-emerald-500/10`}
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Additional Details */}
            {currentStep === 2 && (
              <div className="space-y-5">
                {/* Fiscal Year Start */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Fiscal Year Starts
                  </label>
                  <select
                    value={fiscalYearStart}
                    onChange={(e) => setFiscalYearStart(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isDark
                        ? 'bg-gray-900 border-gray-700 text-white focus:border-emerald-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                    } focus:outline-none focus:ring-4 focus:ring-emerald-500/10`}
                  >
                    {FISCAL_MONTHS.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Company Phone */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Company Phone (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className={`w-5 h-5 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="tel"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all ${
                        isDark
                          ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                      } focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${
                        errors.companyPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
                      }`}
                    />
                  </div>
                  {errors.companyPhone && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.companyPhone}</p>
                  )}
                </div>

                {/* Company Email */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Company Email (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`w-5 h-5 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="contact@company.com"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all ${
                        isDark
                          ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                      } focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${
                        errors.companyEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
                      }`}
                    />
                  </div>
                  {errors.companyEmail && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.companyEmail}</p>
                  )}
                </div>

                {/* Timezone (Read-only) */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={timezone}
                    readOnly
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      isDark
                        ? 'bg-gray-900 border-gray-700 text-gray-400'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    } cursor-not-allowed`}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                {errors.general}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={tenantMutation.isPending}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    isDark
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Back
                </button>
              )}
              
              <button
                type="submit"
                disabled={tenantMutation.isPending}
                className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-teal-600 hover:from-emerald-600 hover:via-teal-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 flex items-center justify-center gap-2 group"
              >
                {tenantMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : currentStep === 1 ? (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Complete Setup
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function TenantSetupPage() {
  return <TenantSetupContent />;
}

