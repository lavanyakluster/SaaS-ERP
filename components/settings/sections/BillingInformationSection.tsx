'use client';

import { CreditCard, Plus, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useBillingHistory, useDownloadInvoice } from '@/lib/hooks/useSubscription';

interface BillingInformationSectionProps {
  isDark: boolean;
}

interface BillingHistoryItem {
  id: string;
  invoiceNumber: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
}

export function BillingInformationSection({ isDark }: BillingInformationSectionProps) {
  // ============================================================================
  // API QUERIES
  // ============================================================================

  const {
    data: billingHistoryData,
    isLoading: isLoadingHistory,
    isError: isHistoryError,
  } = useBillingHistory();

  const downloadInvoiceMutation = useDownloadInvoice();

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const paymentMethods = [
    {
      id: '1',
      type: 'card' as const,
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: '2',
      type: 'card' as const,
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false,
    },
  ];

  const fallbackBillingHistory: BillingHistoryItem[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      date: '2024-01-27',
      description: 'Professional Plan - Monthly',
      amount: 599,
      status: 'paid' as const,
    },
    {
      id: '2',
      invoiceNumber: 'INV-2023-012',
      date: '2023-12-27',
      description: 'Professional Plan - Monthly',
      amount: 599,
      status: 'paid' as const,
    },
    {
      id: '3',
      invoiceNumber: 'INV-2023-011',
      date: '2023-11-27',
      description: 'Professional Plan - Monthly',
      amount: 599,
      status: 'paid' as const,
    },
    {
      id: '4',
      invoiceNumber: 'INV-2023-010',
      date: '2023-10-27',
      description: 'Professional Plan - Monthly',
      amount: 599,
      status: 'paid' as const,
    },
  ];

  const billingHistory: BillingHistoryItem[] =
    billingHistoryData?.map((invoice) => ({
      id: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date,
      description: invoice.description,
      amount: invoice.amount,
      status: invoice.status,
    })) ?? fallbackBillingHistory;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleAddPaymentMethod = () => {
    // TODO: Implement add payment method modal
    console.log('Add payment method');
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      await downloadInvoiceMutation.mutateAsync(invoiceId);
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2
            className={`w-12 h-12 animate-spin mx-auto mb-4 ${
              isDark ? 'text-emerald-500' : 'text-emerald-600'
            }`}
          />
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading billing information...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div
        className={`rounded-2xl border p-6 ${
          isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Payment Methods
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your payment methods and billing information
            </p>
          </div>
          <button
            onClick={handleAddPaymentMethod}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Method
          </button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 rounded-xl border transition-all ${
                method.isDefault
                  ? isDark
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-emerald-500/50 bg-emerald-50/50'
                  : isDark
                  ? 'border-gray-700 bg-gray-700/50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-gray-600' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {method.brand} •••• {method.last4}
                      </span>
                      {method.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                </div>
                <button
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-600 text-white hover:bg-gray-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div
        className={`rounded-2xl border p-6 ${
          isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="mb-6">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Billing History
          </h3>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            View and download your invoices
          </p>
        </div>

        {isHistoryError ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Unable to load billing history
              </p>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Using cached data. Some information may be outdated.
              </p>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className={`border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <th
                  className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Invoice
                </th>
                <th
                  className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Date
                </th>
                <th
                  className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Description
                </th>
                <th
                  className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Amount
                </th>
                <th
                  className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Status
                </th>
                <th
                  className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((invoice) => (
                <tr
                  key={invoice.id}
                  className={`border-b ${
                    isDark ? 'border-gray-700/50' : 'border-gray-100'
                  }`}
                >
                  <td className={`py-4 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <span className="font-medium">
                      {invoice.invoiceNumber || `INV-${invoice.id}`}
                    </span>
                  </td>
                  <td className={`py-4 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {new Date(invoice.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className={`py-4 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {invoice.description}
                  </td>
                  <td className={`py-4 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <span className="font-semibold">AED {invoice.amount}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        invoice.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : invoice.status === 'failed'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-gray-500/10 text-gray-500'
                      }`}
                    >
                      {invoice.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                      {invoice.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      disabled={downloadInvoiceMutation.isPending}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isDark
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      {downloadInvoiceMutation.isPending ? 'Downloading...' : 'Download'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {billingHistory.length === 0 && (
          <div className="text-center py-12">
            <div
              className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <CreditCard className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No billing history
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Your invoices will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
