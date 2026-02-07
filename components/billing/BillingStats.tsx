import { LucideIcon } from 'lucide-react';

interface Stat {
  title: string;
  value: string;
  icon: LucideIcon;
  gradient: string;
}

interface BillingStatsProps {
  stats: Stat[];
  theme?: 'light' | 'dark';
}

export function BillingStats({ stats, theme = 'light' }: BillingStatsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`p-6 rounded-2xl border transition-all hover:scale-105 shadow-lg ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                : 'bg-white border-gray-200 hover:border-emerald-200 hover:shadow-emerald-100'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}