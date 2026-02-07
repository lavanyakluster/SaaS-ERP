import { Building2, LucideIcon } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'white' | 'glass';
  icon?: LucideIcon;
  showText?: boolean;
  title?: string;
  subtitle?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

const sizeMap = {
  sm: {
    container: 'w-8 h-8',
    icon: 'w-4 h-4',
    title: 'text-sm',
    subtitle: 'text-xs',
    rounded: 'rounded-lg'
  },
  md: {
    container: 'w-10 h-10',
    icon: 'w-5 h-5',
    title: 'text-base',
    subtitle: 'text-xs',
    rounded: 'rounded-xl'
  },
  lg: {
    container: 'w-12 h-12',
    icon: 'w-6 h-6',
    title: 'text-lg',
    subtitle: 'text-xs',
    rounded: 'rounded-xl'
  },
  xl: {
    container: 'w-14 h-14',
    icon: 'w-7 h-7',
    title: 'text-2xl',
    subtitle: 'text-sm',
    rounded: 'rounded-2xl'
  }
};

const variantMap = {
  default: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg',
  gradient: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl',
  white: 'bg-white/20 backdrop-blur-sm text-white',
  glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white'
};

export function Logo({
  size = 'md',
  variant = 'default',
  icon: Icon = Building2,
  showText = true,
  title = 'SmartBook',
  subtitle = 'Cloud ERP Solution',
  theme = 'light',
  className = ''
}: LogoProps) {
  const sizes = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizes.container} ${variantMap[variant]} ${sizes.rounded} flex items-center justify-center flex-shrink-0`}>
        <Icon className={sizes.icon} />
      </div>
      {showText && (
        <div>
          <h1 className={`${sizes.title} font-bold ${
            variant === 'white' || variant === 'glass' 
              ? 'text-white' 
              : theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`${sizes.subtitle} ${
              variant === 'white' || variant === 'glass' 
                ? 'text-white/80' 
                : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}