'use client';

import { useMemo } from 'react';
import { 
  Users, UserX, TrendingUp, Gift, Star, Award, 
  DollarSign, BarChart3, Trophy, Sparkles, Crown,
  ShoppingBag, ArrowUpRight, ArrowDownRight, Target
} from 'lucide-react';
import { motion } from 'motion/react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useTheme } from '@/lib/store/theme-store';
import { useLoyaltyDashboard } from '@/lib/hooks/useLoyaltyDashboard';
import {
  calculateDashboardMetrics,
  getTopLoyalCustomers,
  generateMonthlyTrend,
  calculateTransactionSummary,
  calculateRewardAnalysis,
  getTierDistribution,
  type TopLoyalCustomer,
} from '@/lib/api/loyalty.api';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  delay?: number;
}

const MetricCard = ({ title, value, icon: Icon, color, delay = 0 }: MetricCardProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={`rounded-lg border p-4 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className={`font-sans text-xs font-medium ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {title}
        </p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <motion.p 
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
        className={`font-sans text-2xl font-bold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        {value}
      </motion.p>
    </motion.div>
  );
};

const formatNumber = (value: number): string => {
  if (value == null || isNaN(value)) return '0';
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const formatPercentage = (value: number): string => {
  if (value == null || isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
};

interface LoyaltyDashboardProps {
  dateFrom?: string;
  dateTo?: string;
}

export function LoyaltyDashboard({ dateFrom, dateTo }: LoyaltyDashboardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Use props if provided, otherwise fall back to current year defaults
  const currentYear = new Date().getFullYear();
  const defaultDateFrom = `${currentYear}-01-01`;
  const defaultDateTo = `${currentYear}-12-31`;
  
  const effectiveDateFrom = dateFrom || defaultDateFrom;
  const effectiveDateTo = dateTo || defaultDateTo;
  
  const { data: rawData, isLoading, error } = useLoyaltyDashboard({
    dateFrom: effectiveDateFrom,
    dateTo: effectiveDateTo
  });

  const metrics = useMemo(() => {
    if (!rawData?.length) return null;
    return calculateDashboardMetrics(rawData);
  }, [rawData]);

  const topCustomers = useMemo(() => {
    if (!rawData?.length) return [];
    return getTopLoyalCustomers(rawData, 10);
  }, [rawData]);

  const monthlyTrend = useMemo(() => {
    if (!rawData?.length) return [];
    return generateMonthlyTrend(rawData);
  }, [rawData]);

  const transactionSummary = useMemo(() => {
    if (!rawData?.length) return null;
    return calculateTransactionSummary(rawData);
  }, [rawData]);

  const rewardAnalysis = useMemo(() => {
    if (!rawData?.length) return null;
    return calculateRewardAnalysis(rawData);
  }, [rawData]);

  const tierDistribution = useMemo(() => {
    if (!rawData?.length) return [];
    return getTierDistribution(rawData);
  }, [rawData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading loyalty data...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserX className="w-8 h-8 mx-auto mb-2 text-red-600" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Failed to load loyalty data</p>
        </div>
      </div>
    );
  }

  // ECharts colors based on theme
  const chartColors = {
    primary: '#3b82f6',
    textColor: isDark ? '#9ca3af' : '#374151',
    gridColor: isDark ? '#374151' : '#e5e7eb',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    donutColors: ['#94a3b8', '#eab308', '#d97706'], // Gray, Gold, Bronze
  };

  // Monthly Trend Chart (Points Earned Line Chart)
  const monthlyTrendOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartColors.backgroundColor,
      borderColor: chartColors.gridColor,
      borderWidth: 1,
      textStyle: {
        color: chartColors.textColor,
      },
    },
    grid: {
      left: '60px',
      right: '4%',
      bottom: '12%',
      top: '8%',
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: monthlyTrend.map(d => d.month),
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: chartColors.gridColor,
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Points Earned',
        type: 'line',
        data: monthlyTrend.map(d => d.pointsEarned),
        smooth: true,
        lineStyle: {
          color: chartColors.primary,
          width: 2,
        },
        itemStyle: {
          color: chartColors.primary,
        },
        symbol: 'circle',
        symbolSize: 6,
      },
    ],
  };

  // Member Segmentation Donut Chart
  const memberSegmentationOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: chartColors.backgroundColor,
      borderColor: chartColors.gridColor,
      borderWidth: 1,
      textStyle: {
        color: chartColors.textColor,
      },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      show: false,
    },
    series: [
      {
        name: 'Member Tier',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: isDark ? '#1f2937' : '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'outside',
          fontSize: 10,
          color: chartColors.textColor,
          formatter: '{b}\n{d}%',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            color: chartColors.textColor,
          },
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 5,
        },
        data: tierDistribution.slice(0, 5).map((tier, index) => ({
          value: tier.count,
          name: tier.tier,
          itemStyle: {
            color: chartColors.donutColors[index % chartColors.donutColors.length],
          },
        })),
      },
    ],
  };

  return (
    <div className="space-y-3">
      {/* Overview Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`rounded-lg overflow-hidden ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <h3 className={`font-sans text-sm font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Overview Metrics
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              title="Total Active Members"
              value={formatNumber(metrics.totalActiveMembers)}
              icon={Users}
              color="bg-blue-500"
              delay={0}
            />
            <MetricCard
              title="New Member (This Month)"
              value={formatNumber(metrics.newMembersThisMonth)}
              icon={TrendingUp}
              color="bg-green-500"
              delay={0.1}
            />
            <MetricCard
              title="Inactive Members"
              value={formatNumber(metrics.inactiveMembers)}
              icon={UserX}
              color="bg-red-500"
              delay={0.2}
            />
            <MetricCard
              title="Total Points Issued"
              value={formatNumber(metrics.totalPointsIssued)}
              icon={Gift}
              color="bg-purple-500"
              delay={0.3}
            />
            <MetricCard
              title="Total Points Redeemed"
              value={formatNumber(metrics.totalPointsRedeemed)}
              icon={Award}
              color="bg-yellow-500"
              delay={0.4}
            />
            <MetricCard
              title="Total Points Expired"
              value={formatNumber(metrics.totalPointsExpired)}
              icon={Star}
              color="bg-gray-500"
              delay={0.5}
            />
            <MetricCard
              title="Redemption Rate"
              value={formatPercentage(metrics.redemptionRate)}
              icon={DollarSign}
              color="bg-pink-500"
              delay={0.6}
            />
            <MetricCard
              title="Average Points per Member"
              value={formatNumber(metrics.averagePointsPerMember)}
              icon={BarChart3}
              color="bg-indigo-500"
              delay={0.7}
            />
          </div>
        </div>
      </motion.div>

      {/* 3-Column Grid: Member Insights, Transaction Summary, Reward Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Member Insights */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`rounded-lg overflow-hidden ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
          }`}
        >
          <div className="p-4 space-y-3">
            {/* Top 10 Loyal Customers */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <h4 className={`font-sans text-xs font-semibold ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Top 10 Loyal Customers
                </h4>
              </div>
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                {topCustomers.map((customer, index) => (
                  <motion.div 
                    key={customer.rank}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {index < 3 && (
                        <Trophy className={`w-4 h-4 flex-shrink-0 ${
                          index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-gray-400' : 
                          'text-orange-600'
                        }`} />
                      )}
                      <span className={`text-sm font-medium truncate ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {customer.name}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatNumber(customer.pointsEarned)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Member Segmentation */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h4 className={`font-sans text-xs font-semibold ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Member Segmentation
                </h4>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                style={{ height: '200px' }}
              >
                <ReactECharts
                  option={memberSegmentationOption}
                  style={{ height: '100%' }}
                  theme={isDark ? 'dark' : undefined}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Transaction Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`rounded-lg overflow-hidden ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
          }`}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <h4 className={`font-sans text-xs font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Transaction Summary
              </h4>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Sales Linked
                </span>
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
              <p className={`text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {formatNumber(transactionSummary?.totalSalesLinked || 0)}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Percentage of Loyalty Sales
                </span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <p className={`text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {formatPercentage(transactionSummary?.percentageOfLoyaltySales || 0)}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Points Expiry Tracker
                </span>
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <p className={`text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {formatNumber(transactionSummary?.pointsExpiryTracker || 0)}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Reward Analysis */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`rounded-lg overflow-hidden ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
          }`}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <h4 className={`font-sans text-xs font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Reward Analysis
              </h4>
            </div>

            {/* Horizontal Bar for Reward X */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Reward X
                </span>
                <span className={`text-xs font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {rewardAnalysis?.rewardXPercentage || 0}%
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${rewardAnalysis?.rewardXPercentage || 0}%` }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="h-2 rounded-full bg-blue-600"
                ></motion.div>
              </div>
            </motion.div>

            {/* Horizontal Bar for Reward Y */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Reward Y
                </span>
                <span className={`text-xs font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {rewardAnalysis?.rewardYPercentage || 0}%
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${rewardAnalysis?.rewardYPercentage || 0}%` }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="h-2 rounded-full bg-blue-600"
                ></motion.div>
              </div>
            </motion.div>

            {/* Horizontal Bar for Reward Z */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Reward Z
                </span>
                <span className={`text-xs font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {rewardAnalysis?.rewardZPercentage || 0}%
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${rewardAnalysis?.rewardZPercentage || 0}%` }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="h-2 rounded-full bg-blue-600"
                ></motion.div>
              </div>
            </motion.div>

            {/* Reward Cost vs Redemption Value */}
            <div className="space-y-3">
              <h4 className={`font-sans text-xs font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Reward Cost vs Redemption Value
              </h4>
              
              {/* Reward Cost Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    Reward Cost
                  </span>
                  <span className={`text-xs font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatNumber(rewardAnalysis?.rewardCost || 0)}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(100, ((rewardAnalysis?.rewardCost || 0) / Math.max(rewardAnalysis?.rewardCost || 1, rewardAnalysis?.redemptionValue || 1)) * 100)}%` 
                    }}
                    transition={{ duration: 0.8, delay: 1.1 }}
                    className="h-2 rounded-full bg-blue-600"
                  ></motion.div>
                </div>
              </motion.div>

              {/* Redemption Value Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.0 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    Redemption Value
                  </span>
                  <span className={`text-xs font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatNumber(rewardAnalysis?.redemptionValue || 0)}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(100, ((rewardAnalysis?.redemptionValue || 0) / Math.max(rewardAnalysis?.rewardCost || 1, rewardAnalysis?.redemptionValue || 1)) * 100)}%` 
                    }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="h-2 rounded-full bg-blue-600"
                  ></motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trends & Graphs Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className={`rounded-lg overflow-hidden ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h4 className={`font-sans text-xs font-semibold ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Monthly Trend (Points Earned)
            </h4>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            style={{ height: '280px' }}
          >
            <ReactECharts
              option={monthlyTrendOption}
              style={{ height: '100%' }}
              theme={isDark ? 'dark' : undefined}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}