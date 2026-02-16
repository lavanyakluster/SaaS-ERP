import { Metadata } from 'next';
import { SalesTargetDashboard } from '@/components/sales-target/SalesTargetDashboard';

export const metadata: Metadata = {
  title: 'Sales Target Analysis - SmartBook ERP',
  description: 'Sales target achievement analysis and branch performance',
};

export default function SalesTargetPage() {
  return <SalesTargetDashboard />;
}
