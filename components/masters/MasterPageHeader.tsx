import { LucideIcon } from 'lucide-react';
import { Sparkles, Save, Trash2, RotateCcw, FileText } from 'lucide-react';

interface MasterPageHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: {
    from: string;
    via: string;
    to: string;
  };
  theme?: 'light' | 'dark' | 'system';
  className?: string;
  // Action buttons
  onSave?: () => void;
  onDelete?: () => void;
  onClear?: () => void;
  onDocument?: () => void;
  showDelete?: boolean;
  showDocument?: boolean;
}

export function MasterPageHeader({
  title,
  subtitle,
  icon: Icon,
  gradient,
  theme = 'light',
  className = '',
  onSave,
  onDelete,
  onClear,
  onDocument,
  showDelete = true,
  showDocument = true,
}: MasterPageHeaderProps) {
  return (
    <div className={`flex items-center justify-between p-6 border-b ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } shadow-sm ${className}`}>
      {/* Left: Title with Icon */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`
          }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h1>
            <Sparkles className="w-6 h-6 text-teal-500" />
          </div>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Action Buttons - Responsive */}
      <div className="flex items-center gap-2">
        {/* Clear Button - Purple */}
        {onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm"
            title="Clear"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden lg:inline">Clear</span>
          </button>
        )}

        {/* Delete Button - Red */}
        {showDelete && onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden lg:inline">Delete</span>
          </button>
        )}

        {/* Save Button - Green */}
        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm"
            title="Save"
          >
            <Save className="w-4 h-4" />
            <span className="hidden lg:inline">Save</span>
          </button>
        )}

        {/* Document Button - Yellow */}
        {showDocument && onDocument && (
          <button
            onClick={onDocument}
            className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm"
            title="Document"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden lg:inline">Document</span>
          </button>
        )}
      </div>
    </div>
  );
}
