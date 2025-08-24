import React from "react";
import ApiForm from "@/components/ApiForm";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";
import { FormField } from "@/components/ApiForm";
import type { InputFieldConfig } from "@/components/ApiForm";

export interface WorkOrderCompletionTabProps {
  workOrderId: string;
  isReadOnly?: boolean;
}

const WorkOrderCompletionTab: React.FC<WorkOrderCompletionTabProps> = ({
  workOrderId,
  isReadOnly = false,
}) => {
  const queryClient = useQueryClient();

  const { data: completionData } = useQuery({
    queryKey: ["work_order_completion_note", workOrderId],
    queryFn: () =>
      apiCall(
        `/work-orders/work_order_completion_note?work_order=${workOrderId}`
      ),
    enabled: !!workOrderId,
  });

  const handleCompletionSubmit = async (data: Record<string, unknown>) => {
    if (isReadOnly) return; // Prevent submission when read-only

    try {
      const completionId = completionData?.data?.data?.id;
      const initialData = completionData?.data?.data || {};

      // Only send fields that changed
      const changedFields = Object.keys(data).reduce(
        (acc: Record<string, unknown>, key) => {
          if (data[key] !== initialData[key]) {
            acc[key] = data[key];
          }
          return acc;
        },
        {}
      );

      if (completionId) {
        // Update existing completion note with PATCH and only send changed fields
        await apiCall(
          `/work-orders/work_order_completion_note/${completionId}`,
          {
            method: "PATCH",
            body: changedFields,
          }
        );
      } else {
        // Create new completion note if none exists
        await apiCall("/work-orders/work_order_completion_note", {
          method: "POST",
          body: data,
        });
      }
      toast({
        title: "Success",
        description: "Completion notes saved successfully!",
      });
    } catch (error) {
      handleApiError(error, "Failed to save completion notes");
    }
  };

  const handleCompletionFieldChange = async (
    name: string,
    value: unknown,
    allFormData: Record<string, unknown>
  ) => {
    if (isReadOnly) return; // Prevent auto-save when read-only

    try {
      const completionId = completionData?.data?.data?.id;
      const initialData = completionData?.data?.data || {};

      // For field change, we only need to send the changed field
      const dataToSave: Record<string, unknown> = { [name]: value };
      // Include work_order field if creating a new record
      if (!completionId) {
        dataToSave.work_order = workOrderId;
      }

      if (completionId) {
        // Update existing completion note with PATCH and only send changed field
        await apiCall(
          `/work-orders/work_order_completion_note/${completionId}`,
          {
            method: "PATCH",
            body: dataToSave,
          }
        );
      } else {
        // Create new completion note if none exists
        await apiCall("/work-orders/work_order_completion_note", {
          method: "POST",
          body: dataToSave,
        });
      }
    } catch (error) {
      // Silently fail auto-save, user can manually save if needed
      console.error("Auto-save failed:", error);
    }
  };

  const completionFormFields: FormField[] = [
    {
      name: "work_order",
      type: "input",
      inputType: "hidden",
      required: false,
    },
    {
      name: "problem",
      type: "textarea",
      label: "Problem",
      required: false,
      rows: 4,
      disabled: isReadOnly,
    },
    {
      name: "solution",
      type: "textarea",
      label: "Solution",
      required: false,
      rows: 4,
      disabled: isReadOnly,
    },
    {
      name: "completion_notes",
      type: "textarea",
      label: "Completion Notes",
      required: false,
      rows: 4,
      disabled: isReadOnly,
    },
  ];

  return (
    <div className="tab-content-generic">
      {/* Read-only indicator */}
      {isReadOnly && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4 mx-4 mt-4">
          <div className="flex items-center">
            <div className="text-orange-600 text-sm font-medium">
              🔒 This work order is closed. All data is read-only.
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg p-3 bg-card text-card-foreground shadow-card hover:shadow-hover transition-shadow duration-150 border-0 flex flex-col h-full min-h-0 p-0 w-full">
        {/* Problem Analysis and Summary - Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-background/50 rounded border p-3">
            <h4 className="text-sm font-medium text-foreground mb-2 border-b border-border pb-1">
              Problem Analysis
            </h4>
            <ApiForm
              fields={completionFormFields.filter(
                (field) =>
                  field.name === "work_order" ||
                  field.name === "problem" ||
                  field.name === "solution" ||
                  field.name === "completion_notes"
              )}
              onSubmit={handleCompletionSubmit}
              initialData={{
                work_order: workOrderId,
                problem: completionData?.data?.data?.problem || "",
                solution: completionData?.data?.data?.solution || "",
                completion_notes:
                  completionData?.data?.data?.completion_notes || "",
              }}
              submitText={isReadOnly ? undefined : "Save"}
              cancelText={isReadOnly ? undefined : "Cancel"}
              customLayout={({ fields, formData, renderField }) => (
                <div className="space-y-3">
                  {fields.map((field) => {
                    if (
                      "inputType" in field &&
                      (field as InputFieldConfig).inputType === "hidden"
                    ) {
                      return renderField(field);
                    }
                    return (
                      <div
                        key={field.name}
                        onBlur={
                          !isReadOnly
                            ? () => {
                                handleCompletionFieldChange(
                                  field.name,
                                  formData[field.name],
                                  formData
                                );
                              }
                            : undefined
                        }
                      >
                        {renderField(field)}
                      </div>
                    );
                  })}
                </div>
              )}
            />
          </div>

          <div className="bg-background/50 rounded border p-3">
            <h4 className="text-sm font-medium text-foreground mb-2 border-b border-border pb-1">
              Summary
            </h4>
            <div className="space-y-3">
              {/* Compact Summary */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">Hours:</span>
                  <div className="bg-card rounded border px-2 py-1 mt-1">
                    {completionData?.data?.data?.total_hrs_spent || "Not set"}
                  </div>
                </div>
                <div>
                  <span className="font-medium">By:</span>
                  <div className="bg-card rounded border px-2 py-1 mt-1">
                    {completionData?.data?.data?.completed_by || "Not set"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderCompletionTab;
