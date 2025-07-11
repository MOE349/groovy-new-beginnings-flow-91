import React from 'react';
import ApiForm from '@/components/ApiForm';
import { apiPost } from '@/utils/apis';
import { useToast } from '@/hooks/use-toast';

interface FinancialReportFormProps {
  assetId: string;
  onSuccess?: () => void;
}

const FinancialReportForm: React.FC<FinancialReportFormProps> = ({
  assetId,
  onSuccess
}) => {
  const formTemplate = [
    {
      label: "Asset",
      name: "asset",
      size: "1",
      component: "InputGroup",
      required: false,
      value: assetId,
      hidden: true
    },
    {
      label: "Purchase Cost",
      name: "purchase_cost",
      size: "1",
      component: "InputGroup",
      required: true
    },
    {
      label: "Resale Cost",
      name: "resale_cost",
      size: "1",
      component: "InputGroup",
      required: true
    },
    {
      label: "Finance Years",
      name: "finance_years",
      size: "1",
      component: "InputGroup",
      required: true
    },
    {
      label: "Interest Rate",
      name: "interest_rate",
      size: "1",
      component: "InputGroup",
      required: true
    },
    {
      label: "Expected Hours",
      name: "expected_hours",
      size: "1",
      component: "InputGroup",
      required: true
    },
    {
      label: "Operational Cost Per Year",
      name: "operational_cost_per_year",
      size: "1",
      component: "InputGroup",
      required: true
    },
    {
      label: "Capital Work Cost",
      name: "capital_work_cost",
      size: "1",
      component: "InputGroup",
      required: true
    }
  ];

  // Convert template to ApiForm fields
  const formFields = formTemplate
    .filter(field => !field.hidden)
    .map(field => ({
      name: field.name,
      type: 'input' as const,
      inputType: 'number' as const,
      label: field.label,
      required: field.required,
      placeholder: `Enter ${field.label.toLowerCase()}`
    }));

  const { toast } = useToast();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Add the asset ID to the submission data
      const submissionData = {
        ...data,
        asset: assetId
      };

      // Submit to the same endpoint as the right side
      await apiPost(`/financial-reports/${assetId}`, submissionData);
      
      toast({
        title: "Success",
        description: "Financial data saved successfully",
      });

      // Call onSuccess to refresh the right-side data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to submit financial data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save financial data",
        variant: "destructive",
      });
    }
  };

  // Create initial data from template
  const initialData = formTemplate.reduce((acc, field) => {
    if (field.value !== undefined) {
      acc[field.name] = field.value;
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="h-full">
      <ApiForm
        fields={formFields}
        title="Financial Data Entry"
        onSubmit={handleSubmit}
        submitText="Save Financial Data"
        initialData={initialData}
        className="h-full"
      />
    </div>
  );
};

export default FinancialReportForm;