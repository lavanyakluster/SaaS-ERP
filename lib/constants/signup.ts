import { TrendingUp, Shield, Zap, User, Building2, Lock } from 'lucide-react';

// Form Steps Configuration
export const SIGNUP_STEPS = [
  { number: 1, label: 'Personal Info', icon: User },
  { number: 2, label: 'Company Details', icon: Building2 },
  { number: 3, label: 'Security', icon: Lock }
];

// Industry Options
export const INDUSTRIES = [
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'trading', label: 'Trading & Distribution' },
  { value: 'construction', label: 'Construction & Real Estate' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'hospitality', label: 'Hospitality & Food Services' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'technology', label: 'Technology & IT' },
  { value: 'other', label: 'Other' }
];

// Brand Features for Sidebar
export const BRAND_FEATURES = [
  {
    icon: TrendingUp,
    title: 'Real-time Insights',
    description: 'Track your business performance with live dashboards and reports'
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Bank-grade security with full GCC regulatory compliance'
  },
  {
    icon: Zap,
    title: 'Quick Setup',
    description: 'Get started in minutes with our easy onboarding process'
  }
];

// Trust Indicators
export const TRUST_STATS = [
  { value: '2,500+', label: 'Active Businesses' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' }
];

// Step Content Configuration
export const STEP_CONTENT = {
  1: {
    title: 'Create your free account',
    description: 'Get started with SmartBook in just a few steps'
  },
  2: {
    title: 'Tell us about your business',
    description: 'Help us customize your experience'
  },
  3: {
    title: 'Secure your account',
    description: 'Create a strong password to protect your data'
  }
};
