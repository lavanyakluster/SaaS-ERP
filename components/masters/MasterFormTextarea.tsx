import { ChangeEvent } from 'react';

interface MasterFormTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  theme?: 'light' | 'dark';
  className?: string;
}

export function MasterFormTextarea({
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  required = false,
  rows = 3,
  theme = 'light',
  className = ''
}: MasterFormTextareaProps) {
  const textareaClassName = `w-full px-4 py-3 rounded-xl border transition-all resize-y ${
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
      <textarea
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClassName}
      />
    </div>
  );
}
