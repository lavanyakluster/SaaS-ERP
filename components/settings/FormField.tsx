/**
 * Form Field Components
 * Reusable form input components with labels and error states
 */

'use client';

import { memo, InputHTMLAttributes } from 'react';
import { useThemeStore } from '@/lib/store/theme-store';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export const FormField = memo(function FormField({
  label,
  helperText,
  error,
  className = '',
  ...inputProps
}: FormFieldProps) {
  const { isDark } = useThemeStore();

  return (
    <div className={className}>
      <label className={`block text-sm font-semibold mb-2 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
        {inputProps.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...inputProps}
        className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : isDark
            ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20'
            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20'
        } focus:outline-none focus:ring-2`}
      />
      {helperText && !error && (
        <p className={`text-xs mt-1.5 ${
          isDark ? 'text-gray-500' : 'text-gray-500'
        }`}>
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-xs mt-1.5 text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});

interface SelectFieldProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: { value: string; label: string }[];
  helperText?: string;
  error?: string;
}

export const SelectField = memo(function SelectField({
  label,
  options,
  helperText,
  error,
  className = '',
  ...selectProps
}: SelectFieldProps) {
  const { isDark } = useThemeStore();

  return (
    <div className={className}>
      <label className={`block text-sm font-semibold mb-2 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
        {selectProps.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        {...selectProps}
        className={`w-full px-4 py-2.5 rounded-lg border transition-all cursor-pointer ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : isDark
            ? 'bg-gray-900 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20'
            : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500/20'
        } focus:outline-none focus:ring-2`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className={`text-xs mt-1.5 ${
          isDark ? 'text-gray-500' : 'text-gray-500'
        }`}>
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-xs mt-1.5 text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});

interface TextAreaFieldProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
  rows?: number;
}

export const TextAreaField = memo(function TextAreaField({
  label,
  helperText,
  error,
  rows = 4,
  className = '',
  ...textareaProps
}: TextAreaFieldProps) {
  const { isDark } = useThemeStore();

  return (
    <div className={className}>
      <label className={`block text-sm font-semibold mb-2 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
        {textareaProps.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        {...textareaProps}
        rows={rows}
        className={`w-full px-4 py-2.5 rounded-lg border transition-all resize-none ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : isDark
            ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20'
            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20'
        } focus:outline-none focus:ring-2`}
      />
      {helperText && !error && (
        <p className={`text-xs mt-1.5 ${
          isDark ? 'text-gray-500' : 'text-gray-500'
        }`}>
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-xs mt-1.5 text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});