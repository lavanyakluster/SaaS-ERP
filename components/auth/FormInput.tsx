/**
 * FormInput Component
 * Reusable form input with icon, label, and error handling
 */

import { InputHTMLAttributes, ReactNode } from 'react';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
  icon?: ReactNode;
  theme?: 'light' | 'dark' | 'system';
}

export function FormInput({ 
  label, 
  error, 
  icon, 
  theme = 'light',
  disabled,
  ...inputProps 
}: FormInputProps) {
  return (
    <div>
      <label className={`block text-sm font-semibold mb-2 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <div className={`${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {icon}
            </div>
          </div>
        )}
        <input
          disabled={disabled}
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3 rounded-xl border-2 transition-all ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
          } focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${
            error ? 'border-red-500 focus:border-red-500' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          {...inputProps}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
