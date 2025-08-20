import React from "react";
import { TableTab } from "@/components/EntityTabs";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";
import { FormField } from "@/components/ApiForm";

export interface WorkOrderChecklistTabProps {
  workOrderId: string;
  isReadOnly?: boolean;
}

const WorkOrderChecklistTab: React.FC<WorkOrderChecklistTabProps> = ({
  workOrderId,
  isReadOnly = false,
}) => {
  const queryClient = useQueryClient();

  const { data: workOrderData } = useQuery({
    queryKey: ["work_order_checklist_data", workOrderId],
    queryFn: () => apiCall(`/work-orders/work_order/${workOrderId}`),
    enabled: !!workOrderId,
  });

  const checklistFormTemplate: FormField[] = [
    {
      name: "work_order",
      type: "input",
      inputType: "hidden",
      required: false,
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      required: false,
      rows: 3,
    },
    {
      name: "completed_by",
      type: "dropdown",
      label: "Completed By",
      required: false,
      endpoint: "/users/user",
      queryKey: ["users_user"],
      optionValueKey: "id",
      optionLabelKey: "name",
    },
    {
      name: "completion_date",
      type: "datepicker",
      label: "Completion Date",
      required: false,
    },
    {
      name: "hrs_spent",
      type: "input",
      label: "Hrs Spent",
      required: false,
      inputType: "text",
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

      <TableTab
        endpoint={`/work-orders/work_orders/checklists?work_order_id=${workOrderId}`}
        columns={[
          { key: "description", header: "Description", type: "string" },
          { key: "hrs_spent", header: "Hrs Spent", type: "string" },
          {
            key: "completed_by",
            header: "Completed By",
            type: "object",
          },
          {
            key: "completion_date",
            header: "Completion Date",
            type: "date",
          },
        ]}
        queryKey={["work_order_checklists", workOrderId]}
        emptyMessage="No checklist items found"
        canAdd={!isReadOnly}
        addButtonText="Add Checklist Item"
        addFields={checklistFormTemplate}
        addEndpoint="/work-orders/work_orders/checklists"
        addInitialData={{ work_order: workOrderId }}
        canEdit={true}
        editReadOnly={isReadOnly}
        editFields={checklistFormTemplate}
        editEndpoint={(itemId) =>
          `/work-orders/work_orders/checklists/${itemId}`
        }
        editInitialData={(row: Record<string, unknown>) => ({
          ...row,
          work_order: workOrderId,
          completed_by:
            typeof row.completed_by === "object" && row.completed_by
              ? (row.completed_by as Record<string, unknown>)?.id
              : row.completed_by,
          completion_date: row.completion_date
            ? new Date(row.completion_date + "T00:00:00")
            : undefined,
        })}
        actions={
          isReadOnly
            ? []
            : [
                {
                  label: "Load Backlog",
                  variant: "outline",
                  onClick: async () => {
                    try {
                      if (!workOrderData?.data?.data?.asset?.id) {
                        toast({
                          title: "Error",
                          description:
                            "Asset information not available. Please wait for the work order to load.",
                          variant: "destructive",
                        });
                        return;
                      }

                      await apiCall(
                        `/work-orders/work_order/${workOrderId}/import-backlogs`,
                        {
                          method: "POST",
                          body: { asset: workOrderData.data.data.asset.id },
                        }
                      );

                      queryClient.invalidateQueries({
                        queryKey: ["work_order_checklists", workOrderId],
                      });

                      toast({
                        title: "Success",
                        description: "Backlog items imported successfully!",
                      });
                    } catch (error) {
                      handleApiError(error, "Failed to import backlog items");
                    }
                  },
                },
              ]
        }
      />
    </div>
  );
};

export default WorkOrderChecklistTab;
