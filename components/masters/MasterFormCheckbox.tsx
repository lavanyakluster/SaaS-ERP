interface MasterFormCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export function MasterFormCheckbox({
  checked,
  onChange,
  label,
  disabled = false,
  theme = 'light',
  className = ''
}: MasterFormCheckboxProps) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    } ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`w-11 h-6 rounded-full transition-colors ${
          checked
            ? 'bg-teal-500'
            : theme === 'dark'
            ? 'bg-gray-700'
            : 'bg-gray-300'
        } peer-focus:ring-2 peer-focus:ring-teal-500/20`}>
        </div>
        <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}>
        </div>
      </div>
      <span className={`text-sm font-medium ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
      </span>
    </label>
  );
}
