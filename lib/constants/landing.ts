/**
 * Landing Page Constants
 * Extracted to separate file for better performance
 * Static data doesn't need to be recreated on each render
 */

// Type placeholder for Lucide icons
export type LucideIcon = any;

export interface Feature {
  iconName: string;
  title: string;
  description: string;
  gradient: string;
}

export interface Plan {
  name: string;
  price: number;
  description: string;
  iconName: string;
  gradient: string;
  popular?: boolean;
  features: string[];
}

export const LANDING_FEATURES: Feature[] = [
  {
    iconName: 'BarChart3',
    title: 'Real-Time Analytics',
    description: 'Track your business performance with powerful dashboards and real-time insights.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    iconName: 'Shield',
    title: 'Bank-Grade Security',
    description: 'Enterprise-level security with full compliance for GCC regulations and standards.',
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    iconName: 'Zap',
    title: 'Lightning Fast',
    description: 'Optimized performance ensuring your operations run smoothly without delays.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    iconName: 'Globe',
    title: 'Multi-Branch Support',
    description: 'Manage multiple branches and locations from a single unified platform.',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    iconName: 'Users',
    title: 'Team Collaboration',
    description: 'Enable seamless collaboration across departments with role-based access.',
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    iconName: 'TrendingUp',
    title: 'Growth Focused',
    description: 'Scale your business with tools designed to support your growth journey.',
    gradient: 'from-emerald-600 to-green-600',
  },
];

export const LANDING_BENEFITS: readonly string[] = [
  'Streamlined financial management',
  'Automated reporting and compliance',
  'Multi-currency support',
  'Customizable workflows',
  'Mobile-ready interface',
  'RTL Arabic language support',
  '24/7 customer support',
  'Regular updates and improvements',
];

export const LANDING_PLANS: Plan[] = [
  {
    name: 'Basic',
    price: 299,
    description: 'Perfect for small businesses',
    iconName: 'Package',
    gradient: 'from-cyan-500 to-blue-600',
    features: [
      '5 Users included',
      '10 GB Storage',
      'Email Support',
      'Basic Reports',
      'Single Branch',
      'Mobile Access',
    ],
  },
  {
    name: 'Professional',
    price: 599,
    description: 'Most popular for growing teams',
    iconName: 'Zap',
    gradient: 'from-emerald-500 to-teal-600',
    popular: true,
    features: [
      '20 Users included',
      '100 GB Storage',
      'Priority Support',
      'Advanced Reports',
      'Multi-Branch Support',
      'Mobile Access',
      'API Access',
      'Custom Workflows',
    ],
  },
  {
    name: 'Enterprise',
    price: 1299,
    description: 'For large organizations',
    iconName: 'Shield',
    gradient: 'from-teal-600 to-emerald-700',
    features: [
      'Unlimited Users',
      'Unlimited Storage',
      '24/7 Phone Support',
      'Custom Reports',
      'Unlimited Branches',
      'Mobile Access',
      'Full API Access',
      'Custom Integration',
    ],
  },
];
