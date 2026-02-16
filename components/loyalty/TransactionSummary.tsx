'use client';

import { DollarSign, TrendingUp, Clock } from 'lucide-react';

interface TransactionSummaryProps {
  summary: {
    totalSalesLinked: number;
    percentageOfLoyaltySales: number;
    pointsExpiryTracker: number;
  };
}

export default function TransactionSummary({ summary }: TransactionSummaryProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h2>
      
      <div className="space-y-5">
        {/* Total Sales Linked */}
        <div className="flex items-start gap-3">
          <div className="bg-green-50 p-3 rounded-lg">
            <DollarSign className="size-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Total Sales Linked</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalSalesLinked.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">QAR</p>
          </div>
        </div>

        {/* Percentage of Loyalty Sales */}
        <div className="flex items-start gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <TrendingUp className="size-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Percentage of Loyalty Sales</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.percentageOfLoyaltySales}%
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${summary.percentageOfLoyaltySales}%` }}
              />
            </div>
          </div>
        </div>

        {/* Points Expiry Tracker */}
        <div className="flex items-start gap-3">
          <div className="bg-orange-50 p-3 rounded-lg">
            <Clock className="size-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Points Expiry Tracker</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(summary.pointsExpiryTracker).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">points expiring soon</p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {summary.percentageOfLoyaltySales}%
              </p>
              <p className="text-xs text-gray-600">Loyalty Impact</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {(summary.totalSalesLinked / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-600">Sales Volume</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
