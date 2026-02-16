'use client';

interface BalanceSheetItem {
  Particulars: string;  // ✅ Match API field name
  Amount: number;       // ✅ Match API field name
}

interface BalanceSheetTableProps {
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  totalAssets: number;
  totalLiabilities: number;
  netProfit: number;
  isDark: boolean;
}

export function BalanceSheetTable({ 
  assets, 
  liabilities, 
  totalAssets, 
  totalLiabilities, 
  netProfit, 
  isDark 
}: BalanceSheetTableProps) {
  const formatAmount = (amount: number | null | undefined) => {
    if (amount == null || isNaN(amount)) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const grandTotal = totalLiabilities + netProfit;

  return (
    <div className={`rounded-lg border overflow-hidden h-fit ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-3">
        <h3 className="text-white font-semibold text-center">Balance Sheet</h3>
      </div>

      {/* Table Content */}
      <div className="overflow-auto max-h-[700px]">
        <table className="w-full">
          <tbody>
            {/* ASSET Section Header */}
            <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <td className={`px-4 py-2.5 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                ASSET
              </td>
              <td className="px-4 py-2.5"></td>
            </tr>
            
            {/* Asset Items */}
            {assets && assets.length > 0 ? (
              assets.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
                >
                  <td className={`px-4 py-2.5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.Particulars || 'N/A'}
                  </td>
                  <td className={`px-4 py-2.5 text-right text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {formatAmount(item.Amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <td colSpan={2} className={`px-4 py-2.5 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No asset data available
                </td>
              </tr>
            )}

            {/* Total Assets */}
            <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <td className={`px-4 py-2.5 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Total
              </td>
              <td className={`px-4 py-2.5 text-right font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatAmount(totalAssets)}
              </td>
            </tr>

            {/* LIABILITIES Section Header */}
            <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <td className={`px-4 py-2.5 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                LIABILITIES
              </td>
              <td className="px-4 py-2.5"></td>
            </tr>

            {/* Liability Items */}
            {liabilities && liabilities.length > 0 ? (
              liabilities
                .filter(item => item.Particulars !== 'Net Profit') // ✅ Filter out Net Profit (shown separately below)
                .map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
                  >
                    <td className={`px-4 py-2.5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.Particulars || 'N/A'}
                    </td>
                    <td className={`px-4 py-2.5 text-right text-sm ${
                      item.Amount < 0 ? 'text-red-500' : isDark ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {formatAmount(item.Amount)}
                    </td>
                  </tr>
                ))
            ) : (
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <td colSpan={2} className={`px-4 py-2.5 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No liability data available
                </td>
              </tr>
            )}

            {/* Net Profit */}
            <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <td className={`px-4 py-2.5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Net Profit
              </td>
              <td className={`px-4 py-2.5 text-right text-sm ${
                netProfit < 0 ? 'text-red-500' : isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                {formatAmount(netProfit)}
              </td>
            </tr>

            {/* Total Liabilities */}
            <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <td className={`px-4 py-2.5 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Total
              </td>
              <td className={`px-4 py-2.5 text-right font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatAmount(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}