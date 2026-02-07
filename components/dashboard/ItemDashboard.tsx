'use client';

import { useState } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { ABCClassificationChart } from './ABCClassificationChart';
import { ReorderLevelChart } from './ReorderLevelChart';
import { InventoryTable } from './InventoryTable';
import { StockMovementChart } from './StockMovementChart';

interface ItemDashboardProps {
  isDark: boolean;
  itemKPIData: Array<{ label: string; value: string; unit: string; color: string }>;
  abcClassificationData: Array<{ name: string; value: number; color: string }>;
  reorderLevelData: Array<{ name: string; value: number }>;
  inventoryTableData: Array<any>;
  stockMovementData: Array<{ date: string; movement: number }>;
}

export function ItemDashboard({
  isDark,
  itemKPIData,
  abcClassificationData,
  reorderLevelData,
  inventoryTableData,
  stockMovementData,
}: ItemDashboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(inventoryTableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = inventoryTableData.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {itemKPIData.map((kpi, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${kpi.color} rounded-lg p-5 text-white shadow-lg hover:shadow-xl transition-all duration-200`}
          >
            <p className="text-sm opacity-90 mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-bold mb-1">{kpi.value}</h3>
            <p className="text-xs opacity-75">{kpi.unit}</p>
          </div>
        ))}
      </div>

      {/* ABC Classification and Reorder Level */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ABC Classification */}
        <div className="lg:col-span-1">
          <div
            className={`rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } p-6`}
          >
            <h3
              className={`text-sm font-semibold mb-4 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              ABC Classification
            </h3>
            <ABCClassificationChart data={abcClassificationData} isDark={isDark} />
          </div>
        </div>

        {/* Reorder Level Stock Report */}
        <div className="lg:col-span-2">
          <div
            className={`rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-sm font-semibold ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Reorder Level Stock Report
              </h3>
              <div className="flex gap-2">
                <button
                  className={`text-xs px-3 py-1 rounded ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Reorder Level
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Stock Quantity
                </button>
              </div>
            </div>
            <ReorderLevelChart data={reorderLevelData} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div
        className={`rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3
            className={`text-sm font-semibold ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Inventory Details
          </h3>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <InventoryTable data={currentData} isDark={isDark} />

        {/* Pagination */}
        <div
          className={`px-4 py-3 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          } flex items-center justify-between`}
        >
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {startIndex + 1} to {Math.min(endIndex, inventoryTableData.length)} of{' '}
            {inventoryTableData.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${
                isDark
                  ? 'border-gray-600 text-gray-300'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : isDark
                      ? 'border border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${
                isDark
                  ? 'border-gray-600 text-gray-300'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stock Movement Chart */}
      <div
        className={`rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-6`}
      >
        <h3
          className={`text-sm font-semibold mb-4 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Month Wise Stock Movement
        </h3>
        <StockMovementChart data={stockMovementData} isDark={isDark} />
      </div>
    </div>
  );
}
