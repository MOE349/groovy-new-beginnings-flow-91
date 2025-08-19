import React, { useMemo, useState, useCallback } from "react";
import { GenericTab } from "@/components/EntityTabs";
import { ApiTable } from "@/components/ApiTable";
import type { TableColumn } from "@/components/ApiTable/types";
import { ApiForm } from "@/components/ApiForm";
import type { FieldConfig } from "@/components/ApiForm/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";
import { toast } from "@/components/ui/use-toast";

export interface WorkOrderPartsTabProps {
  workOrderId: string;
  isReadOnly?: boolean;
}

interface WorkOrderPart {
  id?: string;
  part?: {
    id?: string;
    number?: string;
    name?: string;
  };
  qty_used?: number;
  work_order?: string;
  [key: string]: unknown;
}

const WorkOrderPartsTab: React.FC<WorkOrderPartsTabProps> = ({
  workOrderId,
  isReadOnly = false,
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WorkOrderPart | null>(
    null
  );
  const queryClient = useQueryClient();

  const columns: TableColumn<WorkOrderPart>[] = [
    {
      key: "part",
      header: "Part Number",
      type: "object",
      render: (value: unknown) => {
        if (!value) return "—";
        const part =
          typeof value === "object" && value !== null
            ? (value as Record<string, unknown>)
            : {};
        // Check for both part_number and number fields
        const partNumber =
          (part.part_number as string) || (part.number as string) || "—";
        return <span className="font-medium">{partNumber}</span>;
      },
    },
    {
      key: "part",
      header: "Part Name",
      type: "object",
      render: (value: unknown) => {
        if (!value) return "—";
        const part =
          typeof value === "object" && value !== null
            ? (value as Record<string, unknown>)
            : {};
        const partName = (part.name as string) || "—";
        return <span>{partName}</span>;
      },
    },
    {
      key: "qty_used",
      header: "QTY",
      type: "text",
    },
  ];

  const formFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "part",
        type: "dropdown",
        label: "Part",
        endpoint: "/parts/parts",
        required: true,
      },
      {
        name: "qty_used",
        type: "input",
        label: "QTY",
        inputType: "number",
        required: true,
      },
      {
        name: "work_order",
        type: "input",
        inputType: "hidden",
        value: workOrderId,
      },
    ],
    [workOrderId]
  );

  const handleSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        await apiCall("/parts/work-order-parts", {
          method: "POST",
          body: data,
        });

        toast({
          title: "Success",
          description: "Part added to work order successfully",
        });

        // Close dialog
        setCreateDialogOpen(false);

        // Invalidate queries to refresh the table
        queryClient.invalidateQueries({
          queryKey: ["work-order-parts", workOrderId],
        });
      } catch (error) {
        console.error("Failed to add part to work order:", error);
        toast({
          title: "Error",
          description: "Failed to add part to work order",
          variant: "destructive",
        });
      }
    },
    [workOrderId, queryClient]
  );

  // Handle row click to open edit dialog
  const handleRowClick = useCallback(
    (record: WorkOrderPart) => {
      if (isReadOnly) return; // Don't allow editing when read-only
      setSelectedRecord(record);
      setEditDialogOpen(true);
    },
    [isReadOnly]
  );

  // Handle edit form submission
  const handleEditSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!selectedRecord) return;

      try {
        await apiCall("/parts/work-order-parts/return", {
          method: "POST",
          body: {
            id: selectedRecord.id,
            part_id: data.part_id,
            qty_used: data.qty_used,
            work_order_id: data.work_order_id,
          },
        });

        toast({
          title: "Success",
          description: "Part quantity updated successfully",
        });

        // Close dialog
        setEditDialogOpen(false);
        setSelectedRecord(null);

        // Invalidate queries to refresh the table
        queryClient.invalidateQueries({
          queryKey: ["work-order-parts", workOrderId],
        });
      } catch (error) {
        console.error("Failed to update part quantity:", error);
        toast({
          title: "Error",
          description: "Failed to update part quantity",
          variant: "destructive",
        });
      }
    },
    [selectedRecord, workOrderId, queryClient]
  );

  // Form fields for editing (only QTY editable)
  const editFormFields: FieldConfig[] = useMemo(() => {
    if (!selectedRecord) return [];

    const part = selectedRecord.part;
    const partObj =
      part && typeof part === "object" ? (part as Record<string, unknown>) : {};
    const partDisplay = part
      ? `${
          (partObj.part_number as string) ||
          (partObj.number as string) ||
          "Unknown"
        } - ${(partObj.name as string) || ""}`
      : "Unknown Part";

    return [
      {
        name: "part_display",
        type: "input",
        label: "Part",
        disabled: true,
        value: partDisplay,
      },
      {
        name: "part_id",
        type: "input",
        inputType: "hidden",
        value: (partObj.id as string) || "",
      },
      {
        name: "qty_used",
        type: "input",
        label: "QTY Used",
        inputType: "number",
        required: true,
      },
      {
        name: "work_order_id",
        type: "input",
        inputType: "hidden",
        value: workOrderId,
      },
    ];
  }, [selectedRecord, workOrderId]);

  return (
    <GenericTab
      title="Parts"
      description="Parts and materials used in this work order"
    >
      {isReadOnly && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4 mx-4 mt-4">
          <div className="flex items-center">
            <div className="text-orange-600 text-sm font-medium">
              🔒 This work order is closed. All data is read-only.
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <ApiTable<WorkOrderPart>
          endpoint="/parts/work-order-parts"
          filters={{ work_order: workOrderId }}
          columns={columns}
          title="Work Order Parts"
          queryKey={["work-order-parts", workOrderId]}
          emptyMessage="No parts assigned to this work order"
          onCreateNew={
            !isReadOnly ? () => setCreateDialogOpen(true) : undefined
          }
          onRowClick={!isReadOnly ? handleRowClick : undefined}
          createNewText="Add Part"
          showFilters={false}
          tableId={`work-order-parts-${workOrderId}`}
        />
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Part to Work Order</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={formFields}
            defaultValues={{
              work_order: workOrderId,
              qty_used: 1,
            }}
            onSubmit={handleSubmit}
            className="space-y-4"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Part Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Part Quantity</DialogTitle>
          </DialogHeader>
          {selectedRecord &&
            (() => {
              const part = selectedRecord.part;
              const partObj =
                part && typeof part === "object"
                  ? (part as Record<string, unknown>)
                  : {};
              const partDisplay = part
                ? `${
                    (partObj.part_number as string) ||
                    (partObj.number as string) ||
                    "Unknown"
                  } - ${(partObj.name as string) || ""}`
                : "Unknown Part";

              return (
                <ApiForm
                  fields={editFormFields}
                  defaultValues={{
                    part_display: partDisplay,
                    part_id: (partObj.id as string) || "",
                    qty_used: selectedRecord.qty_used || 0,
                    work_order_id: workOrderId,
                  }}
                  onSubmit={handleEditSubmit}
                  className="space-y-4"
                />
              );
            })()}
        </DialogContent>
      </Dialog>
    </GenericTab>
  );
};

export default WorkOrderPartsTab;
