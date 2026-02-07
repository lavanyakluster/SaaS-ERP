/**
 * FormDivider Component
 * Horizontal divider with text
 */

interface FormDividerProps {
  text?: string;
  theme?: 'light' | 'dark';
}

export function FormDivider({ text = 'OR', theme = 'light' }: FormDividerProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className={`w-full border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}></div>
      </div>
      <div className="relative flex justify-center text-xs">
        <span className={`px-3 font-medium ${
          theme === 'dark' ? 'bg-gray-900 text-gray-500' : 'bg-gray-50 text-gray-500'
        }`}>
          {text}
        </span>
      </div>
    </div>
  );
}
