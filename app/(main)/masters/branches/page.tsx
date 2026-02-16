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
  MasterFormTextarea,
} from '@/components/masters';
import { Building } from 'lucide-react';

export default function BranchMasterPage() {
  const { theme } = useTheme();
  const { activeGradient } = useGradientStore();

  const [formData, setFormData] = useState({
    branchCode: '',
    bUnitCode: '',
    bUnitName: '',
    store: false,
    name: '',
    address: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    phone: '',
    dcNo: '',
    salesBillNo: '',
    exportBillNo: '',
    quoteNo: '',
    transferBillNo: '',
    grNo: '',
    debitNoteNo: '',
    creditNoteNo: '',
    salesReturnNo: '',
    adjNo: '',
    purchaseReturnNo: '',
    prefix: '',
    gstn: '',
    billFormat: '',
    lastCloseDate: '',
    runningRate: '',
    runningShift: '1',
    autoDate: 'Yes',
    sessionEnabled: 'No',
    autoSkipInBilling: 'No',
    defaultType: 'Credit',
    shiftEnabled: 'No',
    billerCashier: 'No',
    billPrint: false,
    termsCondition: '',
    bankAccount: '',
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving branch:', formData);
    alert('Branch Master saved successfully!');
  };

  const handleClear = () => {
    setFormData({
      branchCode: '',
      bUnitCode: '',
      bUnitName: '',
      store: false,
      name: '',
      address: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      phone: '',
      dcNo: '',
      salesBillNo: '',
      exportBillNo: '',
      quoteNo: '',
      transferBillNo: '',
      grNo: '',
      debitNoteNo: '',
      creditNoteNo: '',
      salesReturnNo: '',
      adjNo: '',
      purchaseReturnNo: '',
      prefix: '',
      gstn: '',
      billFormat: '',
      lastCloseDate: '',
      runningRate: '',
      runningShift: '1',
      autoDate: 'Yes',
      sessionEnabled: 'No',
      autoSkipInBilling: 'No',
      defaultType: 'Credit',
      shiftEnabled: 'No',
      billerCashier: 'No',
      billPrint: false,
      termsCondition: '',
      bankAccount: '',
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this branch?')) {
      handleClear();
      alert('Branch deleted successfully!');
    }
  };

  const yesNoOptions = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ];

  const shiftOptions = [
    { value: '1', label: 'Shift 1' },
    { value: '2', label: 'Shift 2' },
    { value: '3', label: 'Shift 3' }
  ];

  const defaultTypeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Credit', label: 'Credit' }
  ];

  return (
    <MasterLayout title="Branch Master">
      {/* Fixed Header with Action Buttons */}
      <MasterPageHeader
        title="Branch Master"
        subtitle="Configure branch locations and settings"
        icon={Building}
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
          <MasterFormCard theme={theme}>
            <div className="p-6">
              {/* Basic Information */}
              <MasterFormSection
                title="Basic Information"
                columns={3}
                gap={4}
                theme={theme}
              >
                <MasterFormInput
                  value={formData.branchCode}
                  onChange={(value) => handleInputChange('branchCode', value)}
                  placeholder="Branch Code"
                  label="Branch Code"
                  required
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.bUnitCode}
                  onChange={(value) => handleInputChange('bUnitCode', value)}
                  placeholder="Business Unit Code"
                  label="B.Unit Code"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.bUnitName}
                  onChange={(value) => handleInputChange('bUnitName', value)}
                  placeholder="Business Unit Name"
                  label="B.Unit Name"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  placeholder="Branch Name"
                  label="Name"
                  required
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  placeholder="Phone"
                  label="Phone"
                  type="tel"
                  theme={theme}
                  size="sm"
                />

                <MasterFormCheckbox
                  checked={formData.store}
                  onChange={(value) => handleInputChange('store', value)}
                  label="Store"
                  theme={theme}
                />
              </MasterFormSection>

              {/* Address */}
              <MasterFormSection
                title="Address"
                columns={2}
                gap={4}
                theme={theme}
                className="mt-6"
              >
                <MasterFormInput
                  value={formData.address}
                  onChange={(value) => handleInputChange('address', value)}
                  placeholder="Address"
                  label="Address"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.addressLine1}
                  onChange={(value) => handleInputChange('addressLine1', value)}
                  placeholder="Address Line 1"
                  label="Address Line 1"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.addressLine2}
                  onChange={(value) => handleInputChange('addressLine2', value)}
                  placeholder="Address Line 2"
                  label="Address Line 2"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.addressLine3}
                  onChange={(value) => handleInputChange('addressLine3', value)}
                  placeholder="Address Line 3"
                  label="Address Line 3"
                  theme={theme}
                  size="sm"
                />
              </MasterFormSection>

              {/* Bill Numbering */}
              <MasterFormSection
                title="Bill Numbering"
                columns={3}
                gap={4}
                theme={theme}
                className="mt-6"
              >
                <MasterFormInput
                  value={formData.dcNo}
                  onChange={(value) => handleInputChange('dcNo', value)}
                  placeholder="DC No"
                  label="DC No"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.salesBillNo}
                  onChange={(value) => handleInputChange('salesBillNo', value)}
                  placeholder="Sales Bill No"
                  label="Sales Bill No"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.exportBillNo}
                  onChange={(value) => handleInputChange('exportBillNo', value)}
                  placeholder="Export Bill No"
                  label="Export Bill No"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.quoteNo}
                  onChange={(value) => handleInputChange('quoteNo', value)}
                  placeholder="Quote No"
                  label="Quote No"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.transferBillNo}
                  onChange={(value) => handleInputChange('transferBillNo', value)}
                  placeholder="Transfer Bill No"
                  label="Transfer Bill No"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.grNo}
                  onChange={(value) => handleInputChange('grNo', value)}
                  placeholder="GR No"
                  label="GR No"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.debitNoteNo}
                  onChange={(value) => handleInputChange('debitNoteNo', value)}
                  placeholder="Debit Note No"
                  label="Debit Note No"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.creditNoteNo}
                  onChange={(value) => handleInputChange('creditNoteNo', value)}
                  placeholder="Credit Note No"
                  label="Credit Note No"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.salesReturnNo}
                  onChange={(value) => handleInputChange('salesReturnNo', value)}
                  placeholder="Sales Return No"
                  label="Sales Return No"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.adjNo}
                  onChange={(value) => handleInputChange('adjNo', value)}
                  placeholder="Adjustment No"
                  label="Adjustment No"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.purchaseReturnNo}
                  onChange={(value) => handleInputChange('purchaseReturnNo', value)}
                  placeholder="Purchase Return No"
                  label="Purchase Return No"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.prefix}
                  onChange={(value) => handleInputChange('prefix', value)}
                  placeholder="Prefix"
                  label="Prefix"
                  theme={theme}
                  size="sm"
                />
              </MasterFormSection>

              {/* Tax & Configuration */}
              <MasterFormSection
                title="Tax & Configuration"
                columns={3}
                gap={4}
                theme={theme}
                className="mt-6"
              >
                <MasterFormInput
                  value={formData.gstn}
                  onChange={(value) => handleInputChange('gstn', value)}
                  placeholder="GSTN"
                  label="GSTN"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.billFormat}
                  onChange={(value) => handleInputChange('billFormat', value)}
                  placeholder="Bill Format"
                  label="Bill Format"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.lastCloseDate}
                  onChange={(value) => handleInputChange('lastCloseDate', value)}
                  placeholder="Last Close Date"
                  label="Last Close Date"
                  type="date"
                  theme={theme}
                  size="sm"
                />

                <MasterFormInput
                  value={formData.runningRate}
                  onChange={(value) => handleInputChange('runningRate', value)}
                  placeholder="Running Rate"
                  label="Running Rate"
                  theme={theme}
                  size="sm"
                />

                <MasterFormSelect
                  value={formData.runningShift}
                  onChange={(value) => handleInputChange('runningShift', value)}
                  options={shiftOptions}
                  label="Running Shift"
                  theme={theme}
                  size="sm"
                />

                <MasterFormSelect
                  value={formData.autoDate}
                  onChange={(value) => handleInputChange('autoDate', value)}
                  options={yesNoOptions}
                  label="Auto Date"
                  theme={theme}
                  size="sm"
                />

                <MasterFormSelect
                  value={formData.sessionEnabled}
                  onChange={(value) => handleInputChange('sessionEnabled', value)}
                  options={yesNoOptions}
                  label="Session Enabled"
                  theme={theme}
                  size="sm"
                />

                <MasterFormSelect
                  value={formData.autoSkipInBilling}
                  onChange={(value) => handleInputChange('autoSkipInBilling', value)}
                  options={yesNoOptions}
                  label="Auto Skip in Billing"
                  theme={theme}
                  size="sm"
                />

                <MasterFormSelect
                  value={formData.defaultType}
                  onChange={(value) => handleInputChange('defaultType', value)}
                  options={defaultTypeOptions}
                  label="Default Type"
                  theme={theme}
                  size="sm"
                />

                <MasterFormSelect
                  value={formData.shiftEnabled}
                  onChange={(value) => handleInputChange('shiftEnabled', value)}
                  options={yesNoOptions}
                  label="Shift Enabled"
                  theme={theme}
                  size="sm"
                />

                <MasterFormSelect
                  value={formData.billerCashier}
                  onChange={(value) => handleInputChange('billerCashier', value)}
                  options={yesNoOptions}
                  label="Biller/Cashier"
                  theme={theme}
                  size="sm"
                />

                <MasterFormCheckbox
                  checked={formData.billPrint}
                  onChange={(value) => handleInputChange('billPrint', value)}
                  label="Bill Print"
                  theme={theme}
                />
              </MasterFormSection>

              {/* Additional Information */}
              <MasterFormSection
                title="Additional Information"
                columns={1}
                gap={4}
                theme={theme}
                className="mt-6"
              >
                <MasterFormTextarea
                  value={formData.termsCondition}
                  onChange={(value) => handleInputChange('termsCondition', value)}
                  placeholder="Terms & Conditions"
                  label="Terms & Conditions"
                  rows={3}
                  theme={theme}
                />

                <MasterFormInput
                  value={formData.bankAccount}
                  onChange={(value) => handleInputChange('bankAccount', value)}
                  placeholder="Bank Account"
                  label="Bank Account"
                  theme={theme}
                  size="sm"
                />
              </MasterFormSection>
            </div>
          </MasterFormCard>
        </div>
      </div>
    </MasterLayout>
  );
}
