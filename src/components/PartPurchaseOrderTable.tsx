import { useMemo, useState, useCallback } from "react";
import { ApiTable } from "./ApiTable";
import type { ApiTableProps } from "./ApiTable";
import { Dialog, DialogContent } from "./ui/dialog";
import { Card, CardContent, CardHeader } from "./ui/card";
import { apiCall } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import type { FieldConfig } from "@/components/ApiForm";
import { toast } from "@/hooks/use-toast";

export type PartPurchaseOrderTableProps = ApiTableProps<
  Record<string, unknown>
>;

interface PurchaseOrderRow {
  id?: string | number;
  po_number?: string;
  vendor?: { id?: string; name?: string; code?: string } | null;
  vendor_id?: string;
  status?: string;
  order_date?: string;
  expected_date?: string;
  qty_ordered?: number | string;
  qty_received?: number | string;
  unit_cost?: number | string;
  total_cost?: number | string;
  notes?: string;
  [key: string]: unknown;
}

export function PartPurchaseOrderTable(props: PartPurchaseOrderTableProps) {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<PurchaseOrderRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);

  const partId = useMemo(() => {
    const filters = props.filters || {};
    return (filters.part_id as string) || (filters.part as string) || undefined;
  }, [props.filters]);

  // Purchase Order form fields for creation
  const purchaseOrderFormFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "part_id",
        type: "input",
        inputType: "hidden",
        label: "Part ID",
        value: partId || "",
      },
      {
        name: "po_number",
        type: "input",
        label: "PO Number",
        required: true,
        placeholder: "Enter purchase order number",
      },
      {
        name: "vendor_id",
        type: "dropdown",
        label: "Vendor",
        required: true,
        endpoint: "/company/vendors",
        placeholder: "Select vendor",
      },
      {
        name: "qty_ordered",
        type: "input",
        inputType: "number",
        label: "Quantity Ordered",
        required: true,
        placeholder: "Enter quantity",
      },
      {
        name: "unit_cost",
        type: "input",
        inputType: "number",
        label: "Unit Cost",
        placeholder: "Enter unit cost",
        step: "0.01",
      },
      {
        name: "order_date",
        type: "date",
        label: "Order Date",
        required: true,
      },
      {
        name: "expected_date",
        type: "date",
        label: "Expected Date",
        placeholder: "Expected delivery date",
      },
      {
        name: "status",
        type: "select",
        label: "Status",
        required: true,
        options: [
          { value: "pending", label: "Pending" },
          { value: "ordered", label: "Ordered" },
          { value: "partial", label: "Partially Received" },
          { value: "received", label: "Received" },
          { value: "cancelled", label: "Cancelled" },
        ],
        defaultValue: "pending",
      },
      {
        name: "notes",
        type: "textarea",
        label: "Notes",
        placeholder: "Additional notes or comments",
      },
    ],
    [partId]
  );

  // Create purchase order handler
  const openCreate = () => {
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (data: Record<string, any>) => {
    if (!partId) {
      toast({
        title: "Error",
        description: "Part ID is required to create purchase order",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        ...data,
        part_id: partId,
        total_cost:
          data.qty_ordered && data.unit_cost
            ? (
                parseFloat(data.qty_ordered) * parseFloat(data.unit_cost)
              ).toFixed(2)
            : null,
      };

      await apiCall("/purchase-orders", {
        method: "POST",
        body: payload,
      });

      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });

      setCreateOpen(false);
      setReloadNonce((n) => n + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create purchase order",
        variant: "destructive",
      });
    }
  };

  // Row click handler for viewing/editing purchase orders
  const handleRowClick = useCallback((row: Record<string, unknown>) => {
    const r = row as PurchaseOrderRow;
    setSelectedRow(r);
    setOpen(true);
  }, []);

  // Edit form fields (similar to create but with initial data)
  const editFormFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "po_number",
        type: "input",
        label: "PO Number",
        required: true,
        placeholder: "Enter purchase order number",
      },
      {
        name: "vendor_id",
        type: "dropdown",
        label: "Vendor",
        required: true,
        endpoint: "/company/vendors",
        placeholder: "Select vendor",
      },
      {
        name: "qty_ordered",
        type: "input",
        inputType: "number",
        label: "Quantity Ordered",
        required: true,
        placeholder: "Enter quantity",
      },
      {
        name: "qty_received",
        type: "input",
        inputType: "number",
        label: "Quantity Received",
        placeholder: "Enter received quantity",
      },
      {
        name: "unit_cost",
        type: "input",
        inputType: "number",
        label: "Unit Cost",
        placeholder: "Enter unit cost",
        step: "0.01",
      },
      {
        name: "order_date",
        type: "date",
        label: "Order Date",
        required: true,
      },
      {
        name: "expected_date",
        type: "date",
        label: "Expected Date",
        placeholder: "Expected delivery date",
      },
      {
        name: "status",
        type: "select",
        label: "Status",
        required: true,
        options: [
          { value: "pending", label: "Pending" },
          { value: "ordered", label: "Ordered" },
          { value: "partial", label: "Partially Received" },
          { value: "received", label: "Received" },
          { value: "cancelled", label: "Cancelled" },
        ],
      },
      {
        name: "notes",
        type: "textarea",
        label: "Notes",
        placeholder: "Additional notes or comments",
      },
    ],
    []
  );

  const handleEditSubmit = async (data: Record<string, any>) => {
    if (!selectedRow?.id) {
      toast({
        title: "Error",
        description: "Purchase order ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        ...data,
        total_cost:
          data.qty_ordered && data.unit_cost
            ? (
                parseFloat(data.qty_ordered) * parseFloat(data.unit_cost)
              ).toFixed(2)
            : selectedRow.total_cost,
      };

      await apiCall(`/purchase-orders/${selectedRow.id}`, {
        method: "PATCH",
        body: payload,
      });

      toast({
        title: "Success",
        description: "Purchase order updated successfully",
      });

      setOpen(false);
      setSelectedRow(null);
      setReloadNonce((n) => n + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update purchase order",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <ApiTable
        {...props}
        showFilters={true}
        enableColumnReorder={true}
        persistColumnOrder={true}
        onRowClick={handleRowClick}
        title="Open Purchase Orders"
        hasCreateButton={false}
        key={reloadNonce} // Force refresh when data changes
      />

      {/* Edit Purchase Order Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <div className="text-lg font-semibold">Edit Purchase Order</div>
            {selectedRow && (
              <ApiForm
                fields={editFormFields}
                onSubmit={handleEditSubmit}
                initialData={{
                  po_number: selectedRow.po_number,
                  vendor_id: selectedRow.vendor_id,
                  qty_ordered: selectedRow.qty_ordered,
                  qty_received: selectedRow.qty_received,
                  unit_cost: selectedRow.unit_cost,
                  order_date: selectedRow.order_date,
                  expected_date: selectedRow.expected_date,
                  status: selectedRow.status,
                  notes: selectedRow.notes,
                }}
                submitText="Update"
                cancelText="Cancel"
                onCancel={() => setOpen(false)}
                className="space-y-4"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Purchase Order Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <div className="text-lg font-semibold">Create Purchase Order</div>
            <ApiForm
              fields={purchaseOrderFormFields}
              onSubmit={handleCreateSubmit}
              initialData={{
                part_id: partId,
                order_date: new Date().toISOString().split("T")[0],
                status: "pending",
              }}
              submitText="Create"
              cancelText="Cancel"
              onCancel={() => setCreateOpen(false)}
              className="space-y-4"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PartPurchaseOrderTable;
