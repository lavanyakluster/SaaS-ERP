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
  MasterFormSection,
  MasterInfoBox,
} from '@/components/masters';
import { FolderTree } from 'lucide-react';

export default function GroupMasterPage() {
  const { theme } = useTheme();
  const { activeGradient } = useGradientStore();

  const [formData, setFormData] = useState({
    groupCode: '',
    groupName: '',
    parentGroup: '',
    nature: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving group:', formData);
    alert('Group saved successfully!');
  };

  const handleClear = () => {
    setFormData({
      groupCode: '',
      groupName: '',
      parentGroup: '',
      nature: '',
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this group?')) {
      handleClear();
      alert('Group deleted successfully!');
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

  const parentGroupOptions = [
    { value: 'none', label: 'None (Root Group)' },
    { value: 'primary', label: 'Primary' },
    { value: 'assets', label: 'Assets' },
    { value: 'current-assets', label: 'Current Assets' },
    { value: 'fixed-assets', label: 'Fixed Assets' },
    { value: 'liabilities', label: 'Liabilities' },
    { value: 'current-liabilities', label: 'Current Liabilities' },
    { value: 'long-term-liabilities', label: 'Long Term Liabilities' },
    { value: 'capital', label: 'Capital' },
    { value: 'income', label: 'Income' },
    { value: 'expenses', label: 'Expenses' }
  ];

  const natureOptions = [
    { value: 'debit', label: 'Debit' },
    { value: 'credit', label: 'Credit' }
  ];

  return (
    <MasterLayout title="Group Master">
      {/* Fixed Header with Action Buttons */}
      <MasterPageHeader
        title="Group Master"
        subtitle="Manage account grouping hierarchy"
        icon={FolderTree}
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
              {/* Basic Information */}
              <MasterFormSection
                title="Group Information"
                subtitle="Define group hierarchy and properties"
                columns={1}
                gap={4}
                theme={theme}
              >
                <MasterFormInput
                  value={formData.groupCode}
                  onChange={(value) => handleInputChange('groupCode', value)}
                  placeholder="e.g., GRP001"
                  label="Group Code"
                  required
                  theme={theme}
                />

                <MasterFormInput
                  value={formData.groupName}
                  onChange={(value) => handleInputChange('groupName', value)}
                  placeholder="e.g., Sales Accounts"
                  label="Group Name"
                  required
                  theme={theme}
                />

                <MasterFormSelect
                  value={formData.parentGroup}
                  onChange={(value) => handleInputChange('parentGroup', value)}
                  options={parentGroupOptions}
                  placeholder="Select Parent Group"
                  label="Parent Group"
                  theme={theme}
                />

                <MasterFormSelect
                  value={formData.nature}
                  onChange={(value) => handleInputChange('nature', value)}
                  options={natureOptions}
                  placeholder="Select Nature"
                  label="Nature"
                  required
                  theme={theme}
                />
              </MasterFormSection>

              {/* Information Box */}
              <MasterInfoBox
                title="Group Hierarchy Guidelines"
                items={[
                  'Groups can have multiple levels of hierarchy',
                  'Nature (Debit/Credit) determines the account behavior',
                  'Assets and Expenses are typically Debit nature',
                  'Liabilities, Capital, and Income are typically Credit nature',
                  'Parent groups help organize accounts logically'
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
