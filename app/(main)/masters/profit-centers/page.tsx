'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/store/theme-store';
import { useGradientStore } from '@/lib/store/gradient-store';
import {
  MasterLayout,
  MasterPageHeader,
  MasterFormCard,
  MasterFormInput,
  MasterFormSection,
  MasterInfoBox,
} from '@/components/masters';
import { TrendingUp } from 'lucide-react';

export default function ProfitCenterMasterPage() {
  const { theme } = useTheme();
  const { activeGradient } = useGradientStore();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    seqNo: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving profit center:', formData);
    alert('Profit Center saved successfully!');
  };

  const handleClear = () => {
    setFormData({
      code: '',
      name: '',
      seqNo: '',
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this profit center?')) {
      handleClear();
      alert('Profit Center deleted successfully!');
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

  return (
    <MasterLayout title="Profit Center Master">
      {/* Fixed Header with Action Buttons */}
      <MasterPageHeader
        title="Profit Center Master"
        subtitle="Manage profit center allocation"
        icon={TrendingUp}
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
              {/* Profit Center Information */}
              <MasterFormSection
                title="Profit Center Information"
                subtitle="Define profit center details and sequence"
                columns={1}
                gap={4}
                theme={theme}
              >
                <MasterFormInput
                  value={formData.code}
                  onChange={(value) => handleInputChange('code', value)}
                  placeholder="e.g., PC001"
                  label="Profit Center Code"
                  required
                  theme={theme}
                />

                <MasterFormInput
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  placeholder="e.g., North Region Sales"
                  label="Profit Center Name"
                  required
                  theme={theme}
                />

                <MasterFormInput
                  value={formData.seqNo}
                  onChange={(value) => handleInputChange('seqNo', value)}
                  placeholder="Sequence Number"
                  label="Sequence Number"
                  type="number"
                  theme={theme}
                />
              </MasterFormSection>

              {/* Information Box */}
              <MasterInfoBox
                title="Profit Center Guidelines"
                items={[
                  'Profit centers help track performance by department, region, or product line',
                  'Each profit center can have its own income and expense accounts',
                  'Sequence number determines the display order in reports',
                  'Common examples: Regional offices, Product divisions, Service departments',
                  'Use descriptive names for easy identification in reports'
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
