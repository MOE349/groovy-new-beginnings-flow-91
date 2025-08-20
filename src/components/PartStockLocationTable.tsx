import React, { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiTable } from "./ApiTable";
import type { ApiTableProps, TableColumn } from "./ApiTable";
import { Dialog, DialogContent } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import ApiDropDown from "./ApiDropDown";
import { Button } from "./ui/button";
import { apiCall } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import type { FieldConfig } from "@/components/ApiForm";
import { toast } from "@/hooks/use-toast";

// Simple UUID v4 generator using crypto API
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export type PartStockLocationTableProps = ApiTableProps<
  Record<string, unknown>
>;

interface StockLocationRow {
  id?: string | number;
  part_number?: string;
  part_name?: string;
  name?: string;
  part?: { number?: string; name?: string } | null;
  location?: { id?: string; name?: string; code?: string } | null; // Should be object with UUID
  location_id?: string; // UUID auto-extracted by ApiTable object ID storage
  site?: { id?: string; name?: string; code?: string } | null; // Should be object with UUID
  site_id?: string; // UUID auto-extracted by ApiTable object ID storage
  qty_on_hand?: number | string;
  aisle?: string;
  row?: string;
  bin?: string;
  last_price?: number | string;
  [key: string]: unknown;
}

export function PartStockLocationTable(props: PartStockLocationTableProps) {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<StockLocationRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [mainCreateOpen, setMainCreateOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);

  const partId = useMemo(() => {
    const filters = props.filters || {};
    return (filters.part_id as string) || (filters.part as string) || undefined;
  }, [props.filters]);

  // Transfer parts form fields
  const transferFormFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "part_id",
        type: "input",
        inputType: "hidden",
        label: "Part ID",
      },
      {
        name: "from_location_id",
        type: "dropdown",
        label: "From Location",
        required: true,
        endpoint: `/parts/get-part-location?part=${partId}`,
        optionValueKey: "id",
        optionLabelKey: "name",
        queryKey: ["parts-get-part-location", partId, "from"],
      },
      {
        name: "to_location_id",
        type: "dropdown",
        label: "To Location",
        required: true,
        endpoint: `/parts/get-part-location?part=${partId}`,
        optionValueKey: "id",
        optionLabelKey: "name",
        queryKey: ["parts-get-part-location", partId, "to"],
      },
      {
        name: "qty",
        type: "input",
        inputType: "number",
        label: "Quantity",
        required: true,
        min: 1,
      },
      {
        name: "idempotency_key",
        type: "input",
        inputType: "hidden",
        label: "Idempotency Key",
      },
    ],
    [partId]
  );

  const [formLocationId, setFormLocationId] = useState<string | undefined>(
    undefined
  );
  const [formAisle, setFormAisle] = useState("");
  const [formRow, setFormRow] = useState("");
  const [formBin, setFormBin] = useState("");
  const [formQtyReceived, setFormQtyReceived] = useState("");
  const [formLastUnitCost, setFormLastUnitCost] = useState("");

  // Main create form state (no initial data)
  const [mainFormLocationId, setMainFormLocationId] = useState<
    string | undefined
  >(undefined);
  const [mainFormAisle, setMainFormAisle] = useState("");
  const [mainFormRow, setMainFormRow] = useState("");
  const [mainFormBin, setMainFormBin] = useState("");
  const [mainFormQtyReceived, setMainFormQtyReceived] = useState("");
  const [mainFormLastUnitCost, setMainFormLastUnitCost] = useState("");

  const resetCreateForm = () => {
    // Use the location_id UUID extracted by ApiTable
    setFormLocationId(
      selectedRow?.location_id ? String(selectedRow.location_id) : undefined
    );
    setFormAisle(selectedRow?.aisle || "");
    setFormRow(selectedRow?.row || "");
    setFormBin(selectedRow?.bin || "");
    setFormQtyReceived("");
    setFormLastUnitCost("");
  };

  const openCreate = () => {
    resetCreateForm();
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!partId || !formLocationId) {
      return;
    }
    const payload: Record<string, unknown> = {
      part: partId,
      location: formLocationId,
      aisle: formAisle || undefined,
      row: formRow || undefined,
      bin: formBin || undefined,
      qty_received: formQtyReceived ? Number(formQtyReceived) : undefined,
      last_unit_cost: formLastUnitCost ? Number(formLastUnitCost) : undefined,
      received_date: new Date().toISOString().slice(0, 10),
    };
    try {
      await apiCall("/parts/inventory-batches", {
        method: "POST",
        body: payload,
      });
      setCreateOpen(false);
      setReloadNonce((n) => n + 1);
    } catch (e) {
      console.error(e);
    }
  };

  const resetMainCreateForm = () => {
    setMainFormLocationId(undefined);
    setMainFormAisle("");
    setMainFormRow("");
    setMainFormBin("");
    setMainFormQtyReceived("");
    setMainFormLastUnitCost("");
  };

  const openMainCreate = () => {
    resetMainCreateForm();
    setMainCreateOpen(true);
  };

  const submitMainCreate = async () => {
    if (!partId || !mainFormLocationId) {
      return;
    }
    const payload: Record<string, unknown> = {
      part: partId,
      location: mainFormLocationId,
      aisle: mainFormAisle || undefined,
      row: mainFormRow || undefined,
      bin: mainFormBin || undefined,
      qty_received: mainFormQtyReceived
        ? Number(mainFormQtyReceived)
        : undefined,
      last_unit_cost: mainFormLastUnitCost
        ? Number(mainFormLastUnitCost)
        : undefined,
      received_date: new Date().toISOString().slice(0, 10),
    };
    try {
      await apiCall("/parts/inventory-batches", {
        method: "POST",
        body: payload,
      });
      setMainCreateOpen(false);
      setReloadNonce((n) => n + 1);
    } catch (e) {
      console.error(e);
    }
  };

  // Transfer parts handlers
  const openTransferDialog = () => {
    setTransferOpen(true);
  };

  const handleTransferSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall("/parts/transfer", {
        method: "POST",
        body: data,
      });
      toast({
        title: "Success",
        description: "Parts transferred successfully!",
      });
      setTransferOpen(false);
      setReloadNonce((n) => n + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to transfer parts",
        variant: "destructive",
      });
    }
  };

  // Transfer form initial data with hidden fields
  const transferFormData = useMemo(
    () => ({
      part_id: partId,
      idempotency_key: generateUUID(),
    }),
    [partId]
  );

  // Left table: movements
  const leftColumns: TableColumn[] = useMemo(
    () => [
      { key: "created_by", header: "Created By", type: "object" },
      { key: "created_at", header: "Created At", type: "date" },
      { key: "movement_type", header: "Movement Type", type: "text" },
      { key: "qty_delta", header: "Qty Delta", type: "text" },
    ],
    []
  );

  // Right table: inventory batches
  const rightColumns: TableColumn[] = useMemo(
    () => [
      { key: "qty_received", header: "Qty Received", type: "text" },
      { key: "last_unit_cost", header: "Last Unit Cost", type: "text" },
      { key: "qty_on_hand", header: "QTY on hand", type: "text" },
      { key: "received_date", header: "Received Date", type: "date" },
    ],
    []
  );

  // Fetch on-hand data for the form section
  // Use the location_id UUID that should be auto-extracted by ApiTable object ID storage
  const locationId = selectedRow?.location_id;

  const shouldFetch = Boolean(selectedRow && partId && locationId);

  const {
    data: onHandData,
    isLoading: onHandLoading,
    error: onHandError,
  } = useQuery({
    queryKey: [
      "parts-on-hand",
      partId || "",
      String(locationId || ""),
      selectedRow?.aisle || "",
      selectedRow?.row || "",
      selectedRow?.bin || "",
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        part: String(partId),
        location: String(locationId),
      });

      if (selectedRow?.aisle) params.append("aisle", selectedRow.aisle);
      if (selectedRow?.row) params.append("row", selectedRow.row);
      if (selectedRow?.bin) params.append("bin", selectedRow.bin);

      const url = `/parts/on-hand?${params.toString()}`;
      const response = await apiCall(url);

      let result = response.data?.data || response.data || [];

      // If result is a single object (not array), wrap it in an array
      if (result && !Array.isArray(result)) {
        result = [result];
      }

      return result;
    },
    enabled: shouldFetch,
  });

  const handleRowClick = useCallback((row: Record<string, unknown>) => {
    const r = row as StockLocationRow;
    setSelectedRow(r);
    setOpen(true);
  }, []);

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-end gap-2">
          <Button
            onClick={openTransferDialog}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            Transfer parts
          </Button>
        </div>
        <ApiTable
          {...props}
          showFilters={false}
          enableColumnReorder={false}
          persistColumnOrder={false}
          onRowClick={handleRowClick}
          createNewText="Create"
          onCreateNew={openMainCreate}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90vw] h-[90vh] max-w-none flex flex-col overflow-hidden">
          <div className="flex flex-col gap-4 h-full overflow-hidden">
            {/* Row 1: Form section - Data from /parts/on-hand/ endpoint */}
            <Card>
              <div className="py-3" />
              <CardContent>
                {onHandLoading ? (
                  <div className="flex justify-center items-center py-8">
                    Loading on-hand data...
                  </div>
                ) : onHandError ? (
                  <div className="flex justify-center items-center py-8 text-red-600">
                    Error loading data: {onHandError.message}
                  </div>
                ) : !shouldFetch ? (
                  <div className="flex flex-col justify-center items-center py-8 text-yellow-600">
                    <div className="text-center">
                      <div>
                        Cannot fetch data - missing required parameters:
                      </div>
                      <div className="text-sm mt-2">
                        partId: {partId || "missing"} | locationId:{" "}
                        {locationId || "missing"}
                      </div>
                      {!locationId &&
                        selectedRow?.location &&
                        typeof selectedRow.location === "string" && (
                          <div className="text-xs mt-2 text-red-500">
                            ⚠️ API Issue: location should be an object with
                            UUID, not string "{selectedRow.location}"
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Row 1: part number, part name, qty, last price */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                      {/* part_number */}
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="col-span-1 text-right text-sm font-medium">
                          Part Number
                        </Label>
                        <Input
                          className="col-span-2"
                          value={
                            onHandData?.[0]?.part_number ||
                            selectedRow?.part_number ||
                            selectedRow?.part?.number ||
                            "-"
                          }
                          readOnly
                          disabled
                        />
                      </div>

                      {/* part_name */}
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="col-span-1 text-right text-sm font-medium">
                          Part Name
                        </Label>
                        <Input
                          className="col-span-2"
                          value={
                            onHandData?.[0]?.part_name ||
                            selectedRow?.part_name ||
                            selectedRow?.name ||
                            selectedRow?.part?.name ||
                            "-"
                          }
                          readOnly
                          disabled
                        />
                      </div>

                      {/* qty on hand */}
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="col-span-1 text-right text-sm font-medium">
                          QTY on hand
                        </Label>
                        <Input
                          className="col-span-2"
                          value={
                            onHandData?.[0]?.qty_on_hand != null
                              ? String(onHandData[0].qty_on_hand)
                              : selectedRow?.qty_on_hand != null
                              ? String(selectedRow.qty_on_hand)
                              : "-"
                          }
                          readOnly
                          disabled
                        />
                      </div>

                      {/* last_price */}
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="col-span-1 text-right text-sm font-medium">
                          Last Price
                        </Label>
                        <Input
                          className="col-span-2"
                          value={
                            onHandData?.[0]?.last_unit_cost != null
                              ? String(onHandData[0].last_unit_cost)
                              : selectedRow?.last_price != null
                              ? String(selectedRow.last_price)
                              : "-"
                          }
                          readOnly
                          disabled
                        />
                      </div>
                    </div>

                    {/* Row 2: location, aisle, row, bin */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                      {/* location */}
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="col-span-1 text-right text-sm font-medium">
                          Location
                        </Label>
                        <Input
                          className="col-span-2"
                          value={
                            onHandData?.[0]?.location?.name ||
                            onHandData?.[0]?.location?.code ||
                            selectedRow?.location?.name ||
                            selectedRow?.location?.code ||
                            "-"
                          }
                          readOnly
                          disabled
                        />
                      </div>

                      {/* aisle */}
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="col-span-1 text-right text-sm font-medium">
                          Aisle
                        </Label>
                        <Input
                          className="col-span-2"
                          value={
                            onHandData?.[0]?.aisle || selectedRow?.aisle || "-"
                          }
                          readOnly
                          disabled
                        />
                      </div>

                      {/* row */}
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="col-span-1 text-right text-sm font-medium">
                          Row
                        </Label>
                        <Input
                          className="col-span-2"
                          value={
                            onHandData?.[0]?.row || selectedRow?.row || "-"
                          }
                          readOnly
                          disabled
                        />
                      </div>

                      {/* bin */}
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="col-span-1 text-right text-sm font-medium">
                          Bin
                        </Label>
                        <Input
                          className="col-span-2"
                          value={
                            onHandData?.[0]?.bin || selectedRow?.bin || "-"
                          }
                          readOnly
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Row 2: Two tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
              <Card className="p-2 flex flex-col h-full">
                <CardContent className="p-0 flex-1 min-h-0 flex flex-col overflow-hidden">
                  <ApiTable
                    endpoint="/parts/movements"
                    filters={{
                      part: partId,
                      location: locationId,
                      ...(selectedRow?.aisle && { aisle: selectedRow.aisle }),
                      ...(selectedRow?.row && { row: selectedRow.row }),
                      ...(selectedRow?.bin && { bin: selectedRow.bin }),
                    }}
                    enabled={shouldFetch}
                    queryKey={[
                      "/parts/movements",
                      String(reloadNonce),
                      partId || "",
                      String(locationId || ""),
                      selectedRow?.aisle || "",
                      selectedRow?.row || "",
                      selectedRow?.bin || "",
                    ]}
                    columns={leftColumns}
                    emptyMessage="No movements found for this location"
                    className="w-full flex-1 min-h-0 flex flex-col"
                    height="100%"
                    showFilters={false}
                    enableColumnReorder={false}
                    persistColumnOrder={false}
                  />
                </CardContent>
              </Card>

              <Card className="p-2 flex flex-col h-full">
                <CardContent className="p-0 flex-1 min-h-0 flex flex-col overflow-hidden">
                  <ApiTable
                    endpoint="/parts/inventory-batches"
                    filters={{
                      part: partId,
                      location: locationId,
                      ...(selectedRow?.aisle && { aisle: selectedRow.aisle }),
                      ...(selectedRow?.row && { row: selectedRow.row }),
                      ...(selectedRow?.bin && { bin: selectedRow.bin }),
                    }}
                    enabled={shouldFetch}
                    queryKey={[
                      "/parts/inventory-batches",
                      String(reloadNonce),
                      partId || "",
                      String(locationId || ""),
                      selectedRow?.aisle || "",
                      selectedRow?.row || "",
                      selectedRow?.bin || "",
                    ]}
                    columns={rightColumns}
                    emptyMessage="Coming soon"
                    className="w-full flex-1 min-h-0 flex flex-col"
                    height="100%"
                    showFilters={false}
                    enableColumnReorder={false}
                    persistColumnOrder={false}
                    title="Inventory Batches"
                    createNewText="Create"
                    onCreateNew={openCreate}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <div className="grid grid-cols-1 gap-4">
            {/* part, location, aisle, row, bin are hidden: carried in payload from selected row context */}

            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1 text-right">Add Quantity</Label>
              <Input
                className="col-span-2"
                value={formQtyReceived}
                onChange={(e) => setFormQtyReceived(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1 text-right">Price</Label>
              <Input
                className="col-span-2"
                value={formLastUnitCost}
                onChange={(e) => setFormLastUnitCost(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitCreate}
                disabled={!partId || !formLocationId}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mainCreateOpen} onOpenChange={setMainCreateOpen}>
        <DialogContent className="max-w-lg">
          <div className="grid grid-cols-1 gap-4">
            {/* part is hidden: carried in payload */}

            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1 text-right">Location</Label>
              <div className="col-span-2">
                <ApiDropDown
                  name="location"
                  endpoint="/company/location"
                  value={mainFormLocationId}
                  onChange={(v) => setMainFormLocationId(v)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1 text-right">Aisle</Label>
              <Input
                className="col-span-2"
                value={mainFormAisle}
                onChange={(e) => setMainFormAisle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1 text-right">Row</Label>
              <Input
                className="col-span-2"
                value={mainFormRow}
                onChange={(e) => setMainFormRow(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1 text-right">Bin</Label>
              <Input
                className="col-span-2"
                value={mainFormBin}
                onChange={(e) => setMainFormBin(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1 text-right">Add Quantity</Label>
              <Input
                className="col-span-2"
                value={mainFormQtyReceived}
                onChange={(e) => setMainFormQtyReceived(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1 text-right">Price</Label>
              <Input
                className="col-span-2"
                value={mainFormLastUnitCost}
                onChange={(e) => setMainFormLastUnitCost(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setMainCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={submitMainCreate}
                disabled={!partId || !mainFormLocationId}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Parts Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <div className="text-lg font-semibold">Transfer Parts</div>
            <ApiForm
              fields={transferFormFields}
              onSubmit={handleTransferSubmit}
              initialData={transferFormData}
              submitText="Transfer"
              cancelText="Cancel"
              onCancel={() => setTransferOpen(false)}
              className="space-y-4"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PartStockLocationTable;
