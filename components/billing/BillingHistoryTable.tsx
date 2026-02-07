import { Download, FileText, CheckCircle, Clock } from 'lucide-react';

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending';
  invoiceUrl: string;
}

interface BillingHistoryTableProps {
  invoices: Invoice[];
  onDownload: (invoiceId: string) => void;
  theme?: 'light' | 'dark';
}

export function BillingHistoryTable({ 
  invoices, 
  onDownload, 
  theme = 'light' 
}: BillingHistoryTableProps) {
  return (
    <div className={`p-6 rounded-2xl border shadow-lg ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Billing History
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Download your past invoices
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Invoice
              </th>
              <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Date
              </th>
              <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Description
              </th>
              <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Amount
              </th>
              <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Status
              </th>
              <th className={`text-right py-3 px-4 font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className={`border-b transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-700 hover:bg-gray-900/50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <td className={`py-4 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {invoice.id}
                  </div>
                </td>
                <td className={`py-4 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {new Date(invoice.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </td>
                <td className={`py-4 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {invoice.description}
                </td>
                <td className={`py-4 px-4 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  AED {invoice.amount}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {invoice.status === 'paid' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button 
                    onClick={() => onDownload(invoice.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                      theme === 'dark'
                        ? 'text-emerald-400 hover:bg-gray-700'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}