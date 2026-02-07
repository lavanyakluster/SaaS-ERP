import { CheckCircle, LucideIcon } from 'lucide-react';

interface Plan {
  name: string;
  price: number;
  description: string;
  icon: LucideIcon;
  gradient: string;
  popular?: boolean;
  features: string[];
}

interface AvailablePlansGridProps {
  plans: Plan[];
  selectedPlan: string;
  onSelectPlan: (planName: string) => void;
  theme?: 'light' | 'dark';
}

export function AvailablePlansGrid({ 
  plans, 
  selectedPlan, 
  onSelectPlan, 
  theme = 'light' 
}: AvailablePlansGridProps) {
  return (
    <div className={`p-6 rounded-2xl border shadow-lg ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Available Plans
      </h3>

      <div className="grid lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`relative p-6 rounded-2xl border-2 transition-all hover:scale-105 shadow-lg ${
                selectedPlan === plan.name
                  ? theme === 'dark'
                    ? 'border-emerald-500 bg-gray-900 shadow-emerald-900/50'
                    : 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-emerald-200'
                  : theme === 'dark'
                  ? 'border-gray-700 bg-gray-900 hover:border-gray-600'
                  : 'border-gray-200 bg-white hover:border-emerald-200 hover:shadow-emerald-100'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold rounded-full shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`w-12 h-12 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              <h4 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h4>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  AED {plan.price}
                </span>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  /month
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 ${
                      theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                    }`} />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.features.length > 6 && (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    +{plan.features.length - 6} more features
                  </p>
                )}
              </div>

              <button
                onClick={() => onSelectPlan(plan.name)}
                className={`w-full py-3 rounded-xl font-semibold transition-all shadow-lg ${
                  selectedPlan === plan.name
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:scale-105'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedPlan === plan.name ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}