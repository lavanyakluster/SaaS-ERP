import { Metadata } from 'next';
import { LoyaltyDashboard } from '@/components/loyalty/LoyaltyDashboard';

export const metadata: Metadata = {
  title: 'Loyalty Dashboard - SmartBook ERP',
  description: 'Loyalty program analytics and insights',
};

export default function LoyaltyPage() {
  return <LoyaltyDashboard />;
}
