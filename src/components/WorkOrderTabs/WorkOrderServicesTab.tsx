import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ApiTable from "@/components/ApiTable";
import ApiForm, { FormField } from "@/components/ApiForm";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";

export interface WorkOrderServicesTabProps {
  workOrderId: string;
  isReadOnly?: boolean;
}

const WorkOrderServicesTab: React.FC<WorkOrderServicesTabProps> = ({
  workOrderId,
  isReadOnly = false,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Record<
    string,
    unknown
  > | null>(null);
  const queryClient = useQueryClient();

  const baseFields: FormField[] = [
    {
      name: "work_order",
      type: "input",
      inputType: "hidden",
      required: false,
    },
    {
      name: "total_cost",
      type: "input",
      label: "Total Cost",
      required: true,
      inputType: "text",
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      required: true,
      rows: 3,
    },
  ];

  const addFormFields: FormField[] = [
    ...baseFields,
    {
      name: "files",
      label: "Files",
      type: "file_manager",
      linkToModel: "work_orders.workordermisccost",
      linkToId: undefined, // Will be set after creation
    },
  ];

  const getEditFormFields = (itemId?: string): FormField[] => [
    ...baseFields,
    {
      name: "files",
      label: "Files",
      type: "file_manager",
      linkToModel: "work_orders.workordermisccost",
      linkToId: itemId,
    },
  ];

  const handleAddSubmit = async (data: Record<string, unknown>) => {
    if (isReadOnly) return; // Prevent submission when read-only

    try {
      const response = await apiCall("/work-orders/work_order_misc_cost", {
        method: "POST",
        body: { work_order: workOrderId, ...data },
      });

      queryClient.invalidateQueries({
        queryKey: ["work_order_misc_cost", workOrderId],
      });

      toast({
        title: "Success",
        description: "Third-party service created successfully!",
      });

      setIsAddDialogOpen(false);
    } catch (error: unknown) {
      handleApiError(error, "Failed to create third-party service");
    }
  };

  const handleEditSubmit = async (data: Record<string, unknown>) => {
    if (!selectedItem || isReadOnly) return; // Prevent submission when read-only

    try {
      await apiCall(`/work-orders/work_order_misc_cost/${selectedItem.id}`, {
        method: "PATCH",
        body: data,
      });

      queryClient.invalidateQueries({
        queryKey: ["work_order_misc_cost", workOrderId],
      });

      toast({
        title: "Success",
        description: "Third-party service updated successfully!",
      });

      setIsEditDialogOpen(false);
      setSelectedItem(null);
    } catch (error: unknown) {
      handleApiError(error, "Failed to update third-party service");
    }
  };

  const handleRowClick = (row: Record<string, unknown>) => {
    setSelectedItem(row);
    setIsEditDialogOpen(true);
  };

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

      <div className="p-4 h-full min-h-[500px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-h3 font-medium text-foreground">
              Third-party Services
            </h3>
          </div>

          <div className="flex gap-2">
            {!isReadOnly && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Third-party Service
                </Button>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Third-party Service</DialogTitle>
                  </DialogHeader>
                  <ApiForm
                    fields={addFormFields}
                    onSubmit={handleAddSubmit}
                    submitText="Add Third-party Service"
                    initialData={{ work_order: workOrderId }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Table */}
        <ApiTable
          endpoint={`/work-orders/work_order_misc_cost?work_order=${workOrderId}`}
          columns={[
            { key: "total_cost", header: "Total Cost", type: "string" },
            { key: "description", header: "Description", type: "string" },
          ]}
          queryKey={["work_order_misc_cost", workOrderId]}
          emptyMessage="No third-party services found"
          onRowClick={handleRowClick}
          className="w-full"
        />

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isReadOnly ? "View" : "Edit"} Third-party Service
              </DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <ApiForm
                fields={
                  isReadOnly
                    ? getEditFormFields(String(selectedItem.id)).map(
                        (field) => ({
                          ...field,
                          disabled: true,
                        })
                      )
                    : getEditFormFields(String(selectedItem.id))
                }
                onSubmit={handleEditSubmit}
                submitText={
                  isReadOnly ? undefined : "Update Third-party Service"
                }
                cancelText={isReadOnly ? undefined : "Cancel"}
                initialData={{
                  ...selectedItem,
                  work_order: workOrderId,
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WorkOrderServicesTab;
