import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider, AuthProvider, QueryProvider } from '@/components/providers';
import { CorruptedTokenGuard } from '@/components/auth';
import { Toaster } from '@/components/ui/sonner';

// Optimize font loading with display swap
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  adjustFontFallback: true,
});

// Metadata for SEO optimization
export const metadata: Metadata = {
  title: {
    default: 'SmartBook - Cloud ERP Solution for GCC Markets',
    template: '%s | SmartBook ERP',
  },
  description: 'Enterprise-grade ERP solution designed for GCC markets. Manage finances, inventory, and operations with bank-grade security and RTL Arabic support.',
  keywords: ['ERP', 'Cloud ERP', 'GCC ERP', 'Accounting Software', 'Business Management', 'Arabic ERP', 'Financial Management'],
  authors: [{ name: 'SmartBook Team' }],
  creator: 'SmartBook',
  publisher: 'SmartBook',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://smartbook.com',
    title: 'SmartBook - Cloud ERP Solution',
    description: 'Enterprise ERP solution for GCC markets with multi-branch support',
    siteName: 'SmartBook',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartBook - Cloud ERP Solution',
    description: 'Enterprise ERP solution for GCC markets',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#059669' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

/**
 * Root Layout Component
 * Server component for optimal performance
 * Theme provider handles client-side hydration
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className} suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <CorruptedTokenGuard />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}