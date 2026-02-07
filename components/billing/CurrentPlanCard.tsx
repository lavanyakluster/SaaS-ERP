import { CheckCircle, LucideIcon } from 'lucide-react';

interface Plan {
  name: string;
  price: number;
  description: string;
  icon: LucideIcon;
  gradient: string;
  features: string[];
}

interface CurrentPlanCardProps {
  plan: Plan;
  theme?: 'light' | 'dark';
}

export function CurrentPlanCard({ plan, theme = 'light' }: CurrentPlanCardProps) {
  const Icon = plan.icon;

  return (
    <div className={`p-6 rounded-2xl border shadow-lg ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Current Plan
          </h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            You are currently on the {plan.name} plan
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${plan.gradient} text-white font-semibold shadow-lg`}>
          Active
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-xl border-2 ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-700'
              : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
          }`}>
            <div className={`w-12 h-12 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h4 className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Plan Features
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}