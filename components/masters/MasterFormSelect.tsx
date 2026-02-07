import { ChangeEvent } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MasterFormSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MasterFormSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  disabled = false,
  required = false,
  theme = 'light',
  size = 'md',
  className = ''
}: MasterFormSelectProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-5 py-4 text-lg'
  };

  const selectClassName = `w-full ${sizeClasses[size]} rounded-xl border transition-all ${
    theme === 'dark'
      ? 'bg-gray-900 border-gray-600 text-gray-400 focus:border-teal-500'
      : 'bg-white border-gray-300 text-gray-500 focus:border-teal-500'
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
      <select
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={selectClassName}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
