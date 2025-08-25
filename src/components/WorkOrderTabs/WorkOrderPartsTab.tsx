import React, { useState } from "react";
import { TableTab } from "@/components/EntityTabs";
import { FormField } from "@/components/ApiForm";
import {
  InlineEditableApiTable,
  EditableTableColumn,
} from "@/components/InlineEditableApiTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ApiForm from "@/components/ApiForm";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";

export interface WorkOrderPartsTabProps {
  workOrderId: string;
  isReadOnly?: boolean;
}

const WorkOrderPartsTab: React.FC<WorkOrderPartsTabProps> = ({
  workOrderId,
  isReadOnly = false,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [currentEditContext, setCurrentEditContext] = useState<{
    rowId: string | number;
    columnKey: string;
    newValue: unknown;
    updatedRow: Record<string, unknown>;
    partId?: string | number;
  } | null>(null);
  const queryClient = useQueryClient();

  const partsFormTemplate: FormField[] = [
    {
      name: "work_order",
      type: "input",
      inputType: "hidden",
      required: false,
    },
    {
      name: "part",
      type: "dropdown",
      label: "Part",
      required: true,
      endpoint: "/parts/parts",
      queryKey: ["parts_parts"],
      optionValueKey: "id",
      optionLabelKey: "name",
    },
  ];

  // Initial data for the form with work_order prefilled
  const initialFormData = {
    work_order: workOrderId,
  };

  // Handle form submission
  const handleFormSubmit = async (data: Record<string, unknown>) => {
    try {
      await apiCall("/parts/work-order-parts", {
        method: "POST",
        body: data,
      });

      toast({
        title: "Success",
        description: "Part added to work order successfully!",
      });

      // Invalidate and refresh the work order parts table
      queryClient.invalidateQueries({
        queryKey: ["work_order_parts", workOrderId],
      });

      setIsDialogOpen(false);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          (error instanceof Error ? error.message : String(error)) ||
          "Failed to add part to work order",
        variant: "destructive",
      });
    }
  };

  // Location selection form for parts that need location when qty_used is set
  const locationFormTemplate: FormField[] = [
    {
      name: "location_id",
      type: "dropdown",
      label: "Location",
      required: true,
      endpoint: `/parts/get-part-location?part=${String(
        currentEditContext?.partId || ""
      )}&work_order=${workOrderId}`,
      optionValueKey: "id",
      optionLabelKey: "name",
      queryKey: [
        "parts-get-part-location",
        String(currentEditContext?.partId || ""),
        workOrderId,
      ],
    },
  ];

  // Handle location form submission
  const handleLocationSubmit = async (data: Record<string, unknown>) => {
    if (!currentEditContext) return;

    try {
      // Create the payload with both qty_used and location
      const updatePayload = {
        [currentEditContext.columnKey]: currentEditContext.newValue,
        location: data.location_id, // Use "location" in payload, but get value from "location_id" field
      };

      // Update the work order part with both qty and location
      await apiCall(`/parts/work-order-parts/${currentEditContext.rowId}`, {
        method: "PATCH",
        body: updatePayload,
      });

      toast({
        title: "Success",
        description: "Part quantity and location updated successfully!",
      });

      // Refresh the table
      queryClient.invalidateQueries({
        queryKey: ["work_order_parts", workOrderId],
      });

      setIsLocationDialogOpen(false);
      setCurrentEditContext(null);
      console.log("Location form submitted, context cleared");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          (error instanceof Error ? error.message : String(error)) ||
          "Failed to update part quantity and location",
        variant: "destructive",
      });
    }
  };

  // Define columns for the inline editable table
  const columns: EditableTableColumn[] = [
    {
      key: "part_number",
      header: "Part Number",
      type: "object",
      editable: false, // Not editable
      render: (value: unknown, row: Record<string, unknown>) => {
        const partObj = row.part;
        if (!partObj) return "—";
        const part =
          typeof partObj === "object" && partObj !== null
            ? (partObj as Record<string, unknown>)
            : {};
        const partNumber =
          (part.part_number as string) || (part.number as string) || "—";
        return <span className="font-medium">{partNumber}</span>;
      },
    },
    {
      key: "part_name",
      header: "Part Name",
      type: "string",
      editable: false, // Not editable
      render: (value: unknown, row: Record<string, unknown>) => {
        const partName = (row.part_name as string) || "—";
        return <span>{partName}</span>;
      },
    },
    {
      key: "qty_used",
      header: "QTY",
      type: "string",
      editable: !isReadOnly, // Only editable if not read-only
      editType: "number",
      validate: (value: string | number) => {
        const numValue =
          typeof value === "number" ? value : parseFloat(String(value));
        if (isNaN(numValue)) {
          return "Must be a valid number";
        }
        if (numValue < 0) {
          return "Quantity cannot be negative";
        }
        return null; // Valid
      },
      editRender: (value, row, onChange, onSave, onCancel) => {
        const handleSave = () => {
          const numValue =
            typeof value === "number" ? value : parseFloat(String(value));
          const originalValue = Number(row.qty_used) || 0;

          // Check if we need location selection for positive quantities
          // Only show dialog if:
          // 1. New value > 0
          // 2. No location assigned
          // 3. Original value was 0/null/undefined (transitioning from empty to positive)
          if (numValue > 0 && !row.location_id && originalValue <= 0) {
            console.log(
              "Triggering location dialog for row:",
              row.id,
              "qty:",
              numValue,
              "originalQty:",
              originalValue
            );

            // Extract part ID from the row data
            const partId =
              row.part_id ||
              (typeof row.part === "object" && row.part !== null
                ? (row.part as Record<string, unknown>).id
                : row.part);

            // Clear any existing context first
            setCurrentEditContext(null);
            setIsLocationDialogOpen(false);

            // Set new context and show dialog
            setTimeout(() => {
              setCurrentEditContext({
                rowId: row.id as string | number,
                columnKey: "qty_used",
                newValue: value,
                updatedRow: row,
                partId: partId as string | number,
              });
              setIsLocationDialogOpen(true);
            }, 100);

            onCancel(); // Cancel the current edit
            return;
          }

          // Normal save if location exists or value is 0
          onSave();
        };

        return (
          <div className="flex items-center gap-1 min-w-[120px]">
            <input
              ref={(ref) => ref && ref.focus()}
              type="number"
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onCancel();
                }
              }}
              className="w-full h-7 px-2 text-xs border rounded"
            />
            <button
              onClick={handleSave}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700 flex items-center justify-center"
            >
              ✓
            </button>
            <button
              onClick={onCancel}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 flex items-center justify-center"
            >
              ✗
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <InlineEditableApiTable
        endpoint={`/parts/work-order-parts?work_order=${workOrderId}`}
        columns={columns}
        queryKey={["work_order_parts", workOrderId]}
        emptyMessage="No parts assigned to this work order"
        updateEndpoint={(itemId) => `/parts/work-order-parts/${itemId}`}
        updateMode="field"
        hasCreateButton={!isReadOnly}
        createNewText="Add Part"
        onCreateNew={() => setIsDialogOpen(true)}
        onCellUpdate={(rowId, columnKey, newValue, updatedRow) => {
          console.log(`Updated ${columnKey} for row ${rowId}:`, newValue);
        }}
        onCellUpdateError={(rowId, columnKey, error) => {
          console.error(
            `Failed to update ${columnKey} for row ${rowId}:`,
            error
          );
        }}
      />

      {/* Add Part Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Part to Work Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ApiForm
              fields={partsFormTemplate}
              onSubmit={handleFormSubmit}
              initialData={initialFormData}
              submitText="Add Part"
              cancelText="Cancel"
              onCancel={() => setIsDialogOpen(false)}
              className="space-y-4"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Selection Dialog */}
      <Dialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Location for Part</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please select a location for this part before setting the
              quantity.
            </p>
            <ApiForm
              fields={locationFormTemplate}
              onSubmit={handleLocationSubmit}
              initialData={{}}
              submitText="Confirm"
              cancelText="Cancel"
              onCancel={() => {
                console.log("Location dialog cancelled, clearing context");
                setIsLocationDialogOpen(false);
                setCurrentEditContext(null);
              }}
              className="space-y-4"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkOrderPartsTab;
