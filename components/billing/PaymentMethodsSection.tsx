import { CreditCard } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[];
  onAddMethod: () => void;
  onEditMethod: (methodId: string) => void;
  theme?: 'light' | 'dark';
}

export function PaymentMethodsSection({ 
  paymentMethods, 
  onAddMethod, 
  onEditMethod,
  theme = 'light' 
}: PaymentMethodsSectionProps) {
  return (
    <div className={`p-6 rounded-2xl border shadow-lg ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Payment Methods
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your payment methods
          </p>
        </div>
        <button 
          onClick={onAddMethod}
          className={`px-4 py-2 rounded-xl font-medium transition-all shadow-md hover:shadow-lg ${
            theme === 'dark'
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-105'
          }`}
        >
          Add Payment Method
        </button>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all hover:scale-105 ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-700 hover:border-gray-600'
                : 'bg-gray-50 border-gray-200 hover:border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <CreditCard className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {method.brand} •••• {method.last4}
                  </p>
                  {method.isDefault && (
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onEditMethod(method.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}