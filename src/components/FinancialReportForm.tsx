import React, { useEffect, useCallback } from "react";
import ApiForm from "@/components/ApiForm";
import ApiInput from "@/components/ApiInput";
import { apiCall } from "@/utils/apis";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useFinancialDataOptimized } from "@/hooks/useFinancialDataOptimized";
import { handleApiError } from "@/utils/errorHandling";

interface FinancialReportFormProps {
  assetId: string;
  onSuccess?: () => void;
  fieldsToShow?: string[];
  containerType?: string;
  columns?: number;
  onSubmitRef?: (submitFn: () => void) => void;
}

const FinancialReportForm: React.FC<FinancialReportFormProps> = ({
  assetId,
  onSuccess,
  fieldsToShow,
  containerType,
  columns = 2,
  onSubmitRef,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use the optimized hook for shared data
  const { data: existingData, isLoading: loading } =
    useFinancialDataOptimized(assetId);

  const formTemplate = [
    {
      label: "Asset",
      name: "asset",
      size: "1",
      component: "InputGroup",
      required: false,
      value: assetId,
      hidden: true,
    },
    {
      label: "Purchase Cost",
      name: "purchase_cost",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true,
    },
    {
      label: "Resale Cost",
      name: "resale_cost",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true,
    },
    {
      label: "Finance Years",
      name: "finance_years",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true,
    },
    {
      label: "Interest Rate",
      name: "interest_rate",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true,
    },
    {
      label: "Expected Hours",
      name: "expected_hours",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true,
    },
    {
      label: "Operational Cost Per Year",
      name: "operational_cost_per_year",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true,
    },
    {
      label: "Capital Work Cost",
      name: "capital_work_cost",
      size: "1",
      component: "InputGroup",
      required: true,
      editable: true,
    },
    // Calculated fields - displayed as disabled
    {
      label: "Monthly Payment",
      name: "monthly_payment",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false,
    },
    {
      label: "Interest Amount",
      name: "interst_amount",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false,
    },
    {
      label: "Yearly Hours",
      name: "yearly_hours",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false,
    },
    {
      label: "Capital Cost Per Hour",
      name: "capital_cost_per_hr",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false,
    },
    {
      label: "Maintenance Cost Per Hour",
      name: "maintnance_cost_per_hr",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false,
    },
    {
      label: "Operational Cost Per Hour",
      name: "operational_cost_per_hr",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false,
    },
    {
      label: "Total Cost Per Hour",
      name: "total_cost_per_hr",
      size: "1",
      component: "InputGroup",
      required: false,
      editable: false,
    },
  ];

  // Convert template to ApiForm fields
  const formFields = formTemplate
    .filter((field) => !field.hidden)
    .filter((field) => !fieldsToShow || fieldsToShow.includes(field.name))
    .map((field) => ({
      name: field.name,
      type: "input" as const,
      inputType:
        field.editable === false ? ("text" as const) : ("number" as const),
      label: field.label,
      required: field.required && field.editable !== false,
      disabled: field.editable === false,
      placeholder:
        field.editable === false ? "" : `Enter ${field.label.toLowerCase()}`,
    }));

  // Check if all fields are disabled (read-only)
  const allFieldsDisabled = formFields.every((field) => field.disabled);

  const handleSubmit = useCallback(
    async (data: Record<string, any>) => {
      try {
        const initialData = existingData || {};

        // Only send fields that changed
        const changedFields = Object.keys(data).reduce(
          (acc: Record<string, any>, key) => {
            if (data[key] !== initialData[key]) {
              acc[key] = data[key];
            }
            return acc;
          },
          {}
        );

        if (existingData && Object.keys(changedFields).length > 0) {
          // Update existing record with PATCH and only send changed fields
          await apiCall(`/financial-reports/${assetId}`, {
            method: "PATCH",
            body: changedFields,
          });
        } else if (!existingData) {
          // Create new record - add assetId to the data
          const submissionData = {
            ...data,
            asset: assetId,
          };
          await apiCall(`/financial-reports/${assetId}`, {
            method: "POST",
            body: submissionData,
          });
        }

        toast({
          title: "Success",
          description: existingData
            ? "Financial data updated successfully"
            : "Financial data saved successfully",
        });

        // Invalidate the shared query to refresh all components
        await queryClient.invalidateQueries({
          queryKey: ["financial-data", assetId],
        });

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Failed to submit financial data:", error);
        handleApiError(error, "Save Failed");
      }
    },
    [existingData, assetId, toast, queryClient, onSuccess]
  );

  // Expose submit function to parent component
  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef(() => handleSubmit(existingData || {}));
    }
  }, [onSubmitRef, existingData, handleSubmit]);

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
        title={
          containerType
            ? ""
            : existingData
            ? "Update Financial Data"
            : "Create Financial Data"
        }
        onSubmit={handleSubmit}
        submitText={
          containerType
            ? existingData
              ? "Update"
              : "Save"
            : existingData
            ? "Update Financial Data"
            : "Save Financial Data"
        }
        initialData={initialData}
        loading={loading}
        className="h-full"
        customLayout={
          containerType
            ? ({ handleSubmit, formData, handleFieldChange }) => {
                // Group fields by type for all container types
                const editableFields = formFields.filter(
                  (field) => !field.disabled
                );
                const readOnlyFields = formFields.filter(
                  (field) => field.disabled
                );

                return (
                  <div className="space-y-2">
                    {/* Editable fields - flexible columns */}
                    {editableFields.length > 0 && (
                      <div className={`grid grid-cols-${columns} gap-2`}>
                        {editableFields.map((field) => (
                          <div key={field.name} className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">
                              {field.label}
                              {field.required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </label>
                            <ApiInput
                              name={field.name}
                              type={field.inputType}
                              placeholder={field.placeholder}
                              value={formData[field.name] || ""}
                              onChange={(value) =>
                                handleFieldChange(field.name, value)
                              }
                              disabled={field.disabled}
                              className="mb-0"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Read-only fields - flexible columns */}
                    {readOnlyFields.length > 0 && (
                      <div className={`grid grid-cols-${columns} gap-2`}>
                        {readOnlyFields.map((field) => (
                          <div key={field.name} className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">
                              {field.label}
                            </label>
                            <span className="text-sm text-foreground block">
                              {formData[field.name] || "-"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
            : undefined
        }
      />
    </div>
  );
};

export default FinancialReportForm;
