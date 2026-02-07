/**
 * PasswordInput Component
 * Password input with show/hide toggle and strength indicator
 */

'use client';

import { useState, InputHTMLAttributes } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  label: string;
  error?: string;
  theme?: 'light' | 'dark';
  showStrength?: boolean;
  strengthScore?: number;
}

export function PasswordInput({ 
  label, 
  error, 
  theme = 'light',
  showStrength = false,
  strengthScore = 0,
  disabled,
  ...inputProps 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getStrengthColor = () => {
    if (strengthScore >= 4) return 'bg-emerald-500';
    if (strengthScore >= 3) return 'bg-yellow-500';
    if (strengthScore >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthLabel = () => {
    if (strengthScore >= 4) return 'Strong';
    if (strengthScore >= 3) return 'Good';
    if (strengthScore >= 2) return 'Fair';
    if (strengthScore >= 1) return 'Weak';
    return '';
  };

  return (
    <div>
      <label className={`block text-sm font-semibold mb-2 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Lock className={`w-5 h-5 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          disabled={disabled}
          className={`w-full pl-11 pr-11 py-3 rounded-xl border-2 transition-all ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
          } focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${
            error ? 'border-red-500 focus:border-red-500' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className={`absolute inset-y-0 right-0 pr-3.5 flex items-center ${
            theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Password Strength Indicator */}
      {showStrength && strengthScore > 0 && (
        <div className="mt-2">
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-1 flex-1 rounded-full transition-all ${
                  level <= strengthScore ? getStrengthColor() : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Password strength: <span className="font-semibold">{getStrengthLabel()}</span>
          </p>
        </div>
      )}
      
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}