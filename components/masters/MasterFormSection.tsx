import { ReactNode } from 'react';

interface MasterFormSectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  theme?: 'light' | 'dark' | 'system';
  columns?: 1 | 2 | 3 | 4;
  gap?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function MasterFormSection({
  title,
  subtitle,
  children,
  theme = 'light',
  columns = 2,
  gap = 6,
  className = ''
}: MasterFormSectionProps) {
  const gridColumns = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gapClass = `gap-${gap}`;

  return (
    <div className={className}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={`grid ${gridColumns[columns]} ${gapClass}`}>
        {children}
      </div>
    </div>
  );
}
