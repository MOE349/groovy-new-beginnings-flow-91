import React from 'react';
import ApiForm from '@/components/ApiForm';

interface FinancialReportFormProps {
  assetId: string;
  onSuccess?: () => void;
}

const FinancialReportForm: React.FC<FinancialReportFormProps> = ({
  assetId,
  onSuccess
}) => {
  const formFields = [
    {
      name: 'assetId',
      type: 'input' as const,
      inputType: 'text' as const,
      label: 'Asset ID',
      disabled: true
    },
    {
      name: 'reportType',
      type: 'dropdown' as const,
      label: 'Report Type',
      required: true,
      options: [
        { value: 'depreciation', label: 'Depreciation' },
        { value: 'maintenance', label: 'Maintenance Cost' },
        { value: 'utilization', label: 'Utilization Report' },
        { value: 'roi', label: 'ROI Analysis' }
      ]
    },
    {
      name: 'amount',
      type: 'input' as const,
      inputType: 'number' as const,
      label: 'Amount',
      required: true,
      placeholder: 'Enter amount'
    },
    {
      name: 'date',
      type: 'datepicker' as const,
      label: 'Report Date',
      required: true
    },
    {
      name: 'description',
      type: 'textarea' as const,
      label: 'Description',
      placeholder: 'Enter report description',
      rows: 3
    },
    {
      name: 'category',
      type: 'dropdown' as const,
      label: 'Category',
      options: [
        { value: 'operational', label: 'Operational' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'capital', label: 'Capital' },
        { value: 'insurance', label: 'Insurance' }
      ]
    }
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // The ApiForm will handle the actual submission
      // When successful, call onSuccess to refresh the right-side data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to submit financial report:', error);
    }
  };

  const initialData = {
    assetId: assetId
  };

  return (
    <div className="h-full">
      <ApiForm
        fields={formFields}
        title="Create Financial Report"
        onSubmit={handleSubmit}
        submitText="Create Report"
        initialData={initialData}
        className="h-full"
      />
    </div>
  );
};

export default FinancialReportForm;