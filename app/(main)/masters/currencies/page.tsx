'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/store/theme-store';
import { useGradientStore } from '@/lib/store/gradient-store';
import {
  MasterLayout,
  MasterPageHeader,
  MasterFormCard,
  MasterFormInput,
  MasterFormSelect,
  MasterFormCheckbox,
  MasterFormSection,
  MasterInfoBox,
} from '@/components/masters';
import { DollarSign } from 'lucide-react';

export default function CurrencyMasterPage() {
  const theme = useTheme();
  const { activeGradient } = useGradientStore();

  const [formData, setFormData] = useState({
    currency: '',
    symbol: '',
    rate: '',
    baseCurrency: false,
    decimal: '',
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving currency:', formData);
    alert('Currency saved successfully!');
  };

  const handleClear = () => {
    setFormData({
      currency: '',
      symbol: '',
      rate: '',
      baseCurrency: false,
      decimal: '',
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this currency?')) {
      handleClear();
      alert('Currency deleted successfully!');
    }
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit?')) {
      handleClear();
    }
  };

  const handleClose = () => {
    if (confirm('Are you sure you want to exit?')) {
      handleClear();
    }
  };

  const currencyOptions = [
    { value: 'AED', label: 'AED - UAE Dirham' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'CNY', label: 'CNY - Chinese Yuan' }
  ];

  return (
    <MasterLayout title="Currency Master">
      {/* Fixed Header with Action Buttons */}
      <MasterPageHeader
        title="Currency Master"
        subtitle="Manage multiple currency support"
        icon={DollarSign}
        gradient={activeGradient}
        theme={theme}
        onSave={handleSave}
        onDelete={handleDelete}
        onClear={handleClear}
        onDocument={() => alert('Document feature coming soon')}
        showDelete={true}
        showDocument={true}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <MasterFormCard theme={theme} maxWidth="5xl">
            <div className="p-8">
              {/* Currency Information */}
              <MasterFormSection
                title="Currency Information"
                subtitle="Select currency and define exchange rate"
                columns={1}
                gap={4}
                theme={theme}
              >
                <MasterFormSelect
                  value={formData.currency}
                  onChange={(value) => handleInputChange('currency', value)}
                  options={currencyOptions}
                  placeholder="Select Currency"
                  label="Currency"
                  required
                  theme={theme}
                />

                <MasterFormInput
                  value={formData.symbol}
                  onChange={(value) => handleInputChange('symbol', value)}
                  placeholder="e.g., $, €, £, د.إ"
                  label="Currency Symbol"
                  required
                  theme={theme}
                />

                <MasterFormInput
                  value={formData.rate}
                  onChange={(value) => handleInputChange('rate', value)}
                  placeholder="Exchange Rate"
                  label="Rate"
                  type="number"
                  required
                  theme={theme}
                />

                <MasterFormCheckbox
                  checked={formData.baseCurrency}
                  onChange={(checked) => handleInputChange('baseCurrency', checked)}
                  label="Set as Base Currency"
                  theme={theme}
                />

                <MasterFormInput
                  value={formData.decimal}
                  onChange={(value) => handleInputChange('decimal', value)}
                  placeholder="Number of decimal places (e.g., 2)"
                  label="Decimal Places"
                  type="number"
                  theme={theme}
                />
              </MasterFormSection>

              {/* Information Box */}
              <MasterInfoBox
                title="Currency Guidelines"
                items={[
                  'Exchange rate is relative to the base currency',
                  'Only one currency can be set as the base currency',
                  'Decimal places typically range from 0 to 4',
                  'Rate updates do not affect historical transactions'
                ]}
                theme={theme}
                variant="info"
                className="mt-6"
              />
            </div>
          </MasterFormCard>
        </div>
      </div>
    </MasterLayout>
  );
}