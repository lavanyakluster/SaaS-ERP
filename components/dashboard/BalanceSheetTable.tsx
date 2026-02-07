'use client';

interface BalanceSheetItem {
  name: string;
  amount: number;
}

interface BalanceSheetTableProps {
  assetsData: BalanceSheetItem[];
  liabilitiesData: BalanceSheetItem[];
  isDark: boolean;
}

export function BalanceSheetTable({ assetsData, liabilitiesData, isDark }: BalanceSheetTableProps) {
  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };

  const totalAssets = assetsData.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = liabilitiesData.reduce((sum, item) => sum + item.amount, 0);
  const grandTotal = totalAssets + totalLiabilities;

  return (
    <div className={`rounded-lg border overflow-hidden h-fit ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-3">
        <h3 className="text-white font-semibold text-sm">Balance Sheet</h3>
      </div>

      {/* Table Content */}
      <div className="overflow-auto max-h-[700px]">
        <table className="w-full text-sm">
          <tbody>
            {/* ASSET Section */}
            <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <td className={`px-4 py-2.5 font-semibold text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                ASSET
              </td>
              <td className="px-4 py-2.5"></td>
            </tr>
            
            {assetsData.map((item, index) => (
              <tr
                key={index}
                className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} hover:bg-opacity-50 transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.name}
                </td>
                <td className={`px-4 py-2 text-right font-medium text-xs ${
                  item.amount >= 0
                    ? isDark ? 'text-gray-300' : 'text-gray-900'
                    : 'text-red-500'
                }`}>
                  {formatAmount(item.amount)}
                </td>
              </tr>
            ))}

            {/* Total Assets */}
            <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <td className={`px-4 py-2.5 font-semibold text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Total
              </td>
              <td className={`px-4 py-2.5 text-right font-bold text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatAmount(totalAssets)}
              </td>
            </tr>

            {/* LIABILITIES Section */}
            <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <td className={`px-4 py-2.5 font-semibold text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                LIABILITIES
              </td>
              <td className="px-4 py-2.5"></td>
            </tr>

            {liabilitiesData.map((item, index) => (
              <tr
                key={index}
                className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} hover:bg-opacity-50 transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.name}
                </td>
                <td className={`px-4 py-2 text-right font-medium text-xs ${
                  item.amount >= 0
                    ? isDark ? 'text-gray-300' : 'text-gray-900'
                    : 'text-red-500'
                }`}>
                  {formatAmount(item.amount)}
                </td>
              </tr>
            ))}

            {/* Total Liabilities */}
            <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <td className={`px-4 py-2.5 font-semibold text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Total
              </td>
              <td className={`px-4 py-2.5 text-right font-bold text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatAmount(totalLiabilities)}
              </td>
            </tr>

            {/* Grand Total */}
            <tr className="bg-gradient-to-r from-cyan-500 to-cyan-600">
              <td className="px-4 py-3 font-bold text-white text-xs">
                Grand Total
              </td>
              <td className="px-4 py-3 text-right font-bold text-white text-xs">
                {formatAmount(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
