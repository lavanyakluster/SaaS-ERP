'use client';

/**
 * Main Layout
 * Layout for main application routes
 * Uses shared AuthenticatedLayout component
 */

import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}