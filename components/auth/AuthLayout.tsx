import { ReactNode } from 'react';

interface AuthLayoutProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  children?: ReactNode;
  sidebar?: ReactNode;
  theme?: 'light' | 'dark' | 'system';
  className?: string;
}

export function AuthLayout({
  leftContent,
  rightContent,
  children,
  sidebar,
  theme = 'light',
  className = ''
}: AuthLayoutProps) {
  // Support both old (children/sidebar) and new (leftContent/rightContent) props
  const mainContent = leftContent || children;
  const sideContent = rightContent || sidebar;

  return (
    <div className={`min-h-screen flex ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
    } ${className}`}>
      {/* Sidebar/Carousel Section - Order first on desktop */}
      {sideContent && (
        <div className="hidden lg:block lg:w-1/2 xl:w-[55%] relative overflow-hidden min-h-screen">
          {sideContent}
        </div>
      )}

      {/* Main Content Section */}
      <div className={`flex-1 flex items-center justify-center p-6 lg:p-12 min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : sideContent ? 'bg-white' : ''
      }`}>
        {mainContent}
      </div>
    </div>
  );
}
