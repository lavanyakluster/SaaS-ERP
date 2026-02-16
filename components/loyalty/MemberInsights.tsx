'use client';

import { TopLoyalCustomer } from '@/lib/api/loyalty.api';
import { Trophy, Medal, Award } from 'lucide-react';

interface MemberInsightsProps {
  topCustomers: TopLoyalCustomer[];
}

export default function MemberInsights({ topCustomers }: MemberInsightsProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="size-4 text-yellow-500" />;
      case 2:
        return <Medal className="size-4 text-gray-400" />;
      case 3:
        return <Award className="size-4 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Member Insights</h2>
      
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Top 10 Loyal Customers</h3>
        <div className="space-y-2">
          {topCustomers.map((customer) => (
            <div key={customer.rank} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center justify-center w-6">
                  {getRankIcon(customer.rank) || (
                    <span className="text-xs text-gray-500 font-medium">{customer.rank}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {customer.name}
                  </p>
                  <p className="text-xs text-gray-500">#{customer.customerCode}</p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm font-semibold text-blue-600">
                  {customer.pointsEarned.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar Visualization */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Top 3 Performance</h3>
        {topCustomers.slice(0, 3).map((customer, index) => {
          const maxPoints = topCustomers[0].pointsEarned;
          const percentage = (customer.pointsEarned / maxPoints) * 100;
          const colors = [
            'bg-blue-500',
            'bg-purple-500',
            'bg-indigo-500',
          ];

          return (
            <div key={customer.rank} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 truncate max-w-[150px]">
                  {customer.name}
                </span>
                <span className="text-xs text-gray-600">
                  {customer.pointsEarned.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${colors[index]} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
