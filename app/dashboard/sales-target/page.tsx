import { redirect } from 'next/navigation';

export default function SalesTargetPage() {
  redirect('/dashboard?tab=sales-target');
}
