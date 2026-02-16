import { ChangeEvent } from 'react';

interface MasterFormInputProps {
  type?: 'text' | 'email' | 'number' | 'tel' | 'date';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  theme?: 'light' | 'dark' | 'system';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MasterFormInput({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  required = false,
  theme = 'light',
  size = 'md',
  className = ''
}: MasterFormInputProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-5 py-4 text-lg'
  };

  const inputClassName = `w-full ${sizeClasses[size]} rounded-xl border transition-all ${
    theme === 'dark'
      ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:border-teal-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500'
  } focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium mb-1.5 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClassName}
      />
    </div>
  );
}
