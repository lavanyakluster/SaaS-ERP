'use client';

import { Target, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { CommonReportFilters, type ReportFilters } from '@/components/reports/CommonReportFilters';

export default function SalesConversion() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleLoadReport = (filters: ReportFilters) => {
    console.log('Loading Sales Conversion with filters:', filters);
    // TODO: Implement API call with filters
  };

  return (
    <div className="space-y-6">
      {/* Common Filters - Always at Top */}
      <CommonReportFilters onLoad={handleLoadReport} />

      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Conversion Rate
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                68.5%
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/30' : 'bg-blue-200'}`}>
              <Target className={`w-5 h-5 ${isDark ? 'text-blue-300' : 'text-blue-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">+5.2%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                Total Leads
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                1,247
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/30' : 'bg-purple-200'}`}>
              <Users className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">+12.8%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                Converted Sales
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                854
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/30' : 'bg-emerald-200'}`}>
              <ShoppingCart className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">+18.5%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                Avg Time to Convert
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                3.2 days
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/30' : 'bg-amber-200'}`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-amber-300' : 'text-amber-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-xs font-semibold">-0.8d</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>faster than before</span>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className={`rounded-xl border overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Sales Funnel Analysis
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Breakdown of conversion stages
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`text-left p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Stage
                </th>
                <th className={`text-right p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Count
                </th>
                <th className={`text-right p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Conversion %
                </th>
                <th className={`text-right p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Drop-off
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { stage: 'Leads Generated', count: 1247, conversion: 100, dropoff: 0 },
                { stage: 'Qualified Leads', count: 1089, conversion: 87.3, dropoff: 158 },
                { stage: 'Proposals Sent', count: 967, conversion: 77.5, dropoff: 122 },
                { stage: 'Negotiations', count: 912, conversion: 73.1, dropoff: 55 },
                { stage: 'Closed Won', count: 854, conversion: 68.5, dropoff: 58 },
              ].map((row, index) => (
                <tr key={index} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <td className={`p-3 ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                    {row.stage}
                  </td>
                  <td className={`p-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>
                    {row.count.toLocaleString()}
                  </td>
                  <td className={`p-3 text-right ${isDark ? 'text-white' : 'text-gray-900'} font-semibold`}>
                    {row.conversion}%
                  </td>
                  <td className={`p-3 text-right ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {row.dropoff > 0 ? `-${row.dropoff}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}