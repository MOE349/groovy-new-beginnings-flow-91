import React, { useState, useEffect } from 'react';
import ApiForm from '@/components/ApiForm';
import { apiPost, apiPut, apiGet } from '@/utils/apis';
import { useToast } from '@/hooks/use-toast';

interface FinancialReportFormProps {
  assetId: string;
  onSuccess?: () => void;
}

const FinancialReportForm: React.FC<FinancialReportFormProps> = ({
  assetId,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<Record<string, any> | null>(null);

  // Fetch existing financial data
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`/financial-reports/${assetId}`);
        
        // Add detailed logging to debug data structure
        console.log('Full API response:', response);
        console.log('Response data:', response.data);
        console.log('Response data type:', typeof response.data);
        
        // Check if data is nested under response.data.data
        const actualData = response.data?.data || response.data;
        console.log('Actual data to use:', actualData);
        
        setExistingData(actualData);
      } catch (error) {
        console.error('Failed to fetch existing financial data:', error);
        // If no data exists, that's fine - it will be a create operation
      } finally {
        setLoading(false);
      }
    };

    fetchExistingData();
  }, [assetId]);
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


  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Add the asset ID to the submission data
      const submissionData = {
        ...data,
        asset: assetId
      };

      // Use PUT for updates if data exists, POST for new records
      if (existingData) {
        await apiPut(`/financial-reports/${assetId}`, submissionData);
      } else {
        await apiPost(`/financial-reports/${assetId}`, submissionData);
      }
      
      toast({
        title: "Success",
        description: existingData ? "Financial data updated successfully" : "Financial data saved successfully",
      });

      // Refetch the updated data to refresh the form
      try {
        const response = await apiGet(`/financial-reports/${assetId}`);
        const actualData = response.data?.data || response.data;
        setExistingData(actualData);
      } catch (error) {
        console.error('Failed to refetch data after save:', error);
      }

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

  // Create initial data from template and existing data
  const initialData = formTemplate.reduce((acc, field) => {
    if (field.value !== undefined) {
      acc[field.name] = field.value;
    } else if (existingData && existingData[field.name] !== undefined) {
      acc[field.name] = existingData[field.name];
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="h-full">
      <ApiForm
        fields={formFields}
        title={existingData ? "Update Financial Data" : "Create Financial Data"}
        onSubmit={handleSubmit}
        submitText={existingData ? "Update Financial Data" : "Save Financial Data"}
        initialData={initialData}
        loading={loading}
        className="h-full"
      />
    </div>
  );
};

export default FinancialReportForm;