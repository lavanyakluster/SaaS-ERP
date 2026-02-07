'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Branch {
  id: string;
  name: string;
  businessUnit: number;
}

interface VirtualBranchListProps {
  branches: Branch[];
  selectedBranches: string[];
  onBranchToggle: (branchId: string) => void;
  isDark: boolean;
}

export function VirtualBranchList({
  branches,
  selectedBranches,
  onBranchToggle,
  isDark,
}: VirtualBranchListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // ✅ Virtual scrolling - only renders visible items
  const rowVirtualizer = useVirtualizer({
    count: branches.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Increased height to accommodate multi-line text
    overscan: 5, // Render 5 extra items above/below viewport
  });

  return (
    <div
      ref={parentRef}
      className="h-full w-full overflow-y-auto"
      style={{
        contain: 'strict', // Performance optimization
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const branch = branches[virtualItem.index];
          const isSelected = selectedBranches.includes(branch.id);

          return (
            <label
              key={branch.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className={`flex items-start justify-between px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer border-b transition-colors ${
                isDark
                  ? 'border-gray-700/50 hover:bg-gray-700/50'
                  : 'border-gray-200/50 hover:bg-blue-50'
              } ${isSelected ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50/50') : ''}`}
            >
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onBranchToggle(branch.id)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs sm:text-sm font-medium break-words leading-tight ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    {branch.name}
                  </div>
                  <div
                    className={`text-[10px] sm:text-xs font-mono mt-0.5 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}
                  >
                    {branch.id} • Unit {branch.businessUnit}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
