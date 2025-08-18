import React, { useMemo, useState, useCallback } from "react";
import { ApiTable } from "./ApiTable";
import type { ApiTableProps, TableColumn } from "./ApiTable";
import { Dialog, DialogContent } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import ApiDropDown from "./ApiDropDown";
import { Button } from "./ui/button";
import { apiCall } from "@/utils/apis";

export type PartStockLocationTableProps = ApiTableProps<
  Record<string, unknown>
>;

interface StockLocationRow {
  id?: string | number;
  part_number?: string;
  part_name?: string;
  name?: string;
  part?: { number?: string; name?: string } | null;
  location?: { id?: string | number; name?: string; code?: string } | null;
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
  const [reloadNonce, setReloadNonce] = useState(0);

  const partId = useMemo(() => {
    const filters = props.filters || {};
    return (filters.part_id as string) || (filters.part as string) || undefined;
  }, [props.filters]);

  const [formLocationId, setFormLocationId] = useState<string | undefined>(
    undefined
  );
  const [formAisle, setFormAisle] = useState("");
  const [formRow, setFormRow] = useState("");
  const [formBin, setFormBin] = useState("");
  const [formQtyReceived, setFormQtyReceived] = useState("");
  const [formLastUnitCost, setFormLastUnitCost] = useState("");

  const resetCreateForm = () => {
    setFormLocationId(
      selectedRow?.location?.id ? String(selectedRow.location.id) : undefined
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

  const handleRowClick = useCallback((row: Record<string, unknown>) => {
    const r = row as StockLocationRow;
    setSelectedRow(r);
    setOpen(true);
  }, []);

  return (
    <>
      <ApiTable
        {...props}
        showFilters={false}
        enableColumnReorder={false}
        persistColumnOrder={false}
        onRowClick={handleRowClick}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <div className="grid grid-cols-1 gap-4">
            {/* Row 1: Form section */}
            <Card>
              <div className="py-3" />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* part_number */}
                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="col-span-1 text-right">Part Number</Label>
                    <Input
                      className="col-span-2"
                      value={
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
                    <Label className="col-span-1 text-right">Part Name</Label>
                    <Input
                      className="col-span-2"
                      value={
                        selectedRow?.part_name ||
                        selectedRow?.name ||
                        selectedRow?.part?.name ||
                        "-"
                      }
                      readOnly
                      disabled
                    />
                  </div>

                  {/* location */}
                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="col-span-1 text-right">Location</Label>
                    <Input
                      className="col-span-2"
                      value={
                        selectedRow?.location?.name ||
                        selectedRow?.location?.code ||
                        (selectedRow?.location?.id != null
                          ? String(selectedRow.location.id)
                          : "-")
                      }
                      readOnly
                      disabled
                    />
                  </div>

                  {/* qty on hand */}
                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="col-span-1 text-right">QTY on hand</Label>
                    <Input
                      className="col-span-2"
                      value={
                        selectedRow?.qty_on_hand != null
                          ? String(selectedRow.qty_on_hand)
                          : "-"
                      }
                      readOnly
                      disabled
                    />
                  </div>

                  {/* aisle */}
                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="col-span-1 text-right">Aisle</Label>
                    <Input
                      className="col-span-2"
                      value={selectedRow?.aisle || "-"}
                      readOnly
                      disabled
                    />
                  </div>

                  {/* row */}
                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="col-span-1 text-right">Row</Label>
                    <Input
                      className="col-span-2"
                      value={selectedRow?.row || "-"}
                      readOnly
                      disabled
                    />
                  </div>

                  {/* bin */}
                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="col-span-1 text-right">Bin</Label>
                    <Input
                      className="col-span-2"
                      value={selectedRow?.bin || "-"}
                      readOnly
                      disabled
                    />
                  </div>

                  {/* last_price */}
                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="col-span-1 text-right">Last Price</Label>
                    <Input
                      className="col-span-2"
                      value={
                        selectedRow?.last_price != null
                          ? String(selectedRow.last_price)
                          : "-"
                      }
                      readOnly
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Row 2: Two tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-2 flex flex-col h-full">
                <CardContent className="p-0 flex-1 min-h-0 flex flex-col overflow-hidden">
                  <ApiTable
                    endpoint="/parts/movements"
                    filters={
                      selectedRow?.location?.id && partId
                        ? {
                            part: partId,
                            location: selectedRow.location.id as
                              | string
                              | number,
                          }
                        : undefined
                    }
                    enabled={Boolean(selectedRow?.location?.id && partId)}
                    queryKey={[
                      "/parts/movements",
                      partId || "",
                      String(selectedRow?.location?.id || ""),
                      String(reloadNonce),
                    ]}
                    columns={leftColumns}
                    emptyMessage="Coming soon"
                    className="w-full flex-1 min-h-0 flex flex-col"
                    height="320px"
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
                    filters={
                      selectedRow?.location?.id && partId
                        ? {
                            part: partId,
                            location: selectedRow.location.id as
                              | string
                              | number,
                          }
                        : undefined
                    }
                    enabled={Boolean(selectedRow?.location?.id && partId)}
                    queryKey={[
                      "/parts/inventory-batches",
                      partId || "",
                      String(selectedRow?.location?.id || ""),
                      String(reloadNonce),
                    ]}
                    columns={rightColumns}
                    emptyMessage="Coming soon"
                    className="w-full flex-1 min-h-0 flex flex-col"
                    height="320px"
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
            {/* part is hidden: carried in payload */}

            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1 text-right">Location</Label>
              <div className="col-span-2">
                <ApiDropDown
                  name="location"
                  endpoint="/company/location"
                  value={formLocationId}
                  onChange={(v) => setFormLocationId(v)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1 text-right">Aisle</Label>
              <Input
                className="col-span-2"
                value={formAisle}
                onChange={(e) => setFormAisle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1 text-right">Row</Label>
              <Input
                className="col-span-2"
                value={formRow}
                onChange={(e) => setFormRow(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1 text-right">Bin</Label>
              <Input
                className="col-span-2"
                value={formBin}
                onChange={(e) => setFormBin(e.target.value)}
              />
            </div>

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
    </>
  );
}

export default PartStockLocationTable;
