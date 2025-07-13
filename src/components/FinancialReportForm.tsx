import React, { useState, useEffect } from 'react';
import ApiForm from '@/components/ApiForm';
import { apiPost, apiPut, apiGet } from '@/utils/apis';
import { useToast } from '@/hooks/use-toast';

interface FinancialReportFormProps {
  assetId: string;
  onSuccess?: () => void;
  fieldsToShow?: string[];
  containerType?: string;
}

const FinancialReportForm: React.FC<FinancialReportFormProps> = ({
  assetId,
  onSuccess,
  fieldsToShow,
  containerType
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
      required: true,
      editable: true
    },
    {
      label: "Resale Cost",
      name: "resale_cost",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true
    },
    {
      label: "Finance Years",
      name: "finance_years",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true
    },
    {
      label: "Interest Rate",
      name: "interest_rate",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true
    },
    {
      label: "Expected Hours",
      name: "expected_hours",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true
    },
    {
      label: "Operational Cost Per Year",
      name: "operational_cost_per_year",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true
    },
    {
      label: "Capital Work Cost",
      name: "capital_work_cost",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true
    },
    // Calculated fields - displayed as disabled
    {
      label: "Monthly Payment",
      name: "monthly_payment",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false
    },
    {
      label: "Interest Amount",
      name: "interst_amount",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false
    },
    {
      label: "Yearly Hours",
      name: "yearly_hours",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false
    },
    {
      label: "Capital Cost Per Hour",
      name: "capital_cost_per_hr",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false
    },
    {
      label: "Maintenance Cost Per Hour",
      name: "maintnance_cost_per_hr",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false
    },
    {
      label: "Operational Cost Per Hour",
      name: "operational_cost_per_hr",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false
    },
    {
      label: "Total Cost Per Hour",
      name: "total_cost_per_hr",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false
    }
  ];

  // Convert template to ApiForm fields
  const formFields = formTemplate
    .filter(field => !field.hidden)
    .filter(field => !fieldsToShow || fieldsToShow.includes(field.name))
    .map(field => ({
      name: field.name,
      type: 'input' as const,
      inputType: field.editable === false ? 'text' as const : 'number' as const,
      label: field.label,
      required: field.required && field.editable !== false,
      disabled: field.editable === false,
      placeholder: field.editable === false ? '' : `Enter ${field.label.toLowerCase()}`
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
      // Handle values that might have currency symbols or be strings
      let value = existingData[field.name];
      if (typeof value === 'string' && value.includes('$')) {
        // Keep the original string value for display fields
        acc[field.name] = value;
      } else {
        acc[field.name] = value;
      }
    }
    return acc;
  }, {} as Record<string, any>);

  console.log('Form initial data:', initialData);
  console.log('Existing data:', existingData);

  return (
    <div className="h-full">
      <ApiForm
        fields={formFields}
        title={containerType ? "" : (existingData ? "Update Financial Data" : "Create Financial Data")}
        onSubmit={handleSubmit}
        submitText={containerType ? (existingData ? "Update" : "Save") : (existingData ? "Update Financial Data" : "Save Financial Data")}
        initialData={initialData}
        loading={loading}
        className="h-full"
        customLayout={containerType ? ({ handleSubmit, renderField }) => (
          <div className="space-y-3">
            {formFields.map(field => (
              <div key={field.name} className="space-y-1">
                {renderField(field)}
              </div>
            ))}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
              >
                {existingData ? "Update" : "Save"}
              </button>
            </div>
          </div>
        ) : undefined}
      />
    </div>
  );
};

export default FinancialReportForm;