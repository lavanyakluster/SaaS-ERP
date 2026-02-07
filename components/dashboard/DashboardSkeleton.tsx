/**
 * Dashboard Skeleton Loader
 * Shows loading state while data is being fetched
 */

interface DashboardSkeletonProps {
  isDark: boolean;
}

export function DashboardSkeleton({ isDark }: DashboardSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className={`h-8 w-64 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 w-48 rounded mt-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
        <div className="flex gap-3">
          <div className={`h-10 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-10 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-10 w-24 rounded-t ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-32 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            } p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-4 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`h-8 w-8 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
            <div className={`h-8 w-32 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        ))}
      </div>

      {/* Widgets Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-[400px] rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            } p-6`}
          >
            <div className={`h-6 w-48 rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`h-4 w-32 rounded mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`h-64 w-full rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}