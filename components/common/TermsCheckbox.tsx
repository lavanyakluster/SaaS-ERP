interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  theme?: 'light' | 'dark' | 'system';
  termsLabel?: string;
  privacyLabel?: string;
  termsLink?: string;
  privacyLink?: string;
}

export function TermsCheckbox({
  checked,
  onChange,
  error,
  theme = 'light',
  termsLabel = 'Terms of Service',
  privacyLabel = 'Privacy Policy',
  termsLink = '#',
  privacyLink = '#'
}: TermsCheckboxProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        />
        <span className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          I agree to SmartBook's{' '}
          <a 
            href={termsLink} 
            className={`font-medium transition-colors ${
              theme === 'dark' 
                ? 'text-emerald-400 hover:text-emerald-300' 
                : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            {termsLabel}
          </a>
          {' '}and{' '}
          <a 
            href={privacyLink} 
            className={`font-medium transition-colors ${
              theme === 'dark' 
                ? 'text-emerald-400 hover:text-emerald-300' 
                : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            {privacyLabel}
          </a>
        </span>
      </label>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 ml-7">{error}</p>
      )}
    </div>
  );
}
