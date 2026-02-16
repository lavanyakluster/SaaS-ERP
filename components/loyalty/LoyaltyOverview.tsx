'use client';

import { LoyaltyDashboardMetrics } from '@/lib/api/loyalty.api';
import { Users, UserPlus, UserX, Award, Coins, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

interface LoyaltyOverviewProps {
  metrics: LoyaltyDashboardMetrics;
}

export default function LoyaltyOverview({ metrics }: LoyaltyOverviewProps) {
  const overviewCards = [
    {
      label: 'Total Active Members',
      value: metrics.totalActiveMembers.toLocaleString(),
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'New Member (This Month)',
      value: metrics.newMembersThisMonth.toLocaleString(),
      icon: UserPlus,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Inactive Members',
      value: metrics.inactiveMembers.toLocaleString(),
      icon: UserX,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Total Points Issued',
      value: metrics.totalPointsIssued.toLocaleString(),
      icon: Award,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Total Points Redeemed',
      value: metrics.totalPointsRedeemed.toLocaleString(),
      icon: Coins,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'Total Points Expired',
      value: metrics.totalPointsExpired.toLocaleString(),
      icon: Calendar,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      label: 'Redemption Rate',
      value: `${metrics.redemptionRate.toFixed(2)}%`,
      icon: TrendingUp,
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      label: 'Average Points per Member',
      value: metrics.averagePointsPerMember.toLocaleString(),
      icon: BarChart3,
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.bgColor} ${card.iconColor} p-3 rounded-lg`}>
                  <Icon className="size-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
