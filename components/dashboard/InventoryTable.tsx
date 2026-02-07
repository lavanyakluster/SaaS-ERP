'use client';

interface InventoryTableProps {
  data: Array<{
    itemType: string;
    category: string;
    barcode: string;
    brand: string;
    currentStock: number;
    reorderPoint: number;
    reorderStatus: string;
    assetValue: string;
    stockState: string;
  }>;
  isDark: boolean;
}

export function InventoryTable({ data, isDark }: InventoryTableProps) {
  const getStatusBadge = (status: string) => {
    if (status === 'In Stock') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          In Stock
        </span>
      );
    } else if (status === 'Low Stock') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
          Low Stock
        </span>
      );
    } else if (status === 'Out of Stock' || status === 'Out') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Out of Stock
        </span>
      );
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            className={`border-b ${
              isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <th
              className={`px-4 py-3 text-left text-xs font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Item Type
            </th>
            <th
              className={`px-4 py-3 text-left text-xs font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Category
            </th>
            <th
              className={`px-4 py-3 text-left text-xs font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Barcode
            </th>
            <th
              className={`px-4 py-3 text-left text-xs font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Brand
            </th>
            <th
              className={`px-4 py-3 text-center text-xs font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Current Stock
            </th>
            <th
              className={`px-4 py-3 text-center text-xs font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Reorder Point
            </th>
            <th
              className={`px-4 py-3 text-center text-xs font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Reorder Status
            </th>
            <th
              className={`px-4 py-3 text-right text-xs font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Asset Value
            </th>
            <th
              className={`px-4 py-3 text-center text-xs font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Stock State
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={`border-b ${
                isDark ? 'border-gray-700' : 'border-gray-100'
              } hover:bg-opacity-50 transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <td
                className={`px-4 py-3 text-xs ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {row.itemType}
              </td>
              <td
                className={`px-4 py-3 text-xs ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {row.category}
              </td>
              <td
                className={`px-4 py-3 text-xs ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {row.barcode}
              </td>
              <td
                className={`px-4 py-3 text-xs ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {row.brand}
              </td>
              <td
                className={`px-4 py-3 text-center text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}
              >
                {row.currentStock}
              </td>
              <td
                className={`px-4 py-3 text-center text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {row.reorderPoint}
              </td>
              <td className="px-4 py-3 text-center">
                {getStatusBadge(row.reorderStatus)}
              </td>
              <td
                className={`px-4 py-3 text-right text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}
              >
                {row.assetValue}
              </td>
              <td className="px-4 py-3 text-center">
                {getStatusBadge(row.stockState)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
