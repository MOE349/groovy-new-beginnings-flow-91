import React from "react";
import { TableColumn } from "@/components/ApiTable";
import { PartStockLocationTable } from "@/components";
import PartPurchaseOrderTable from "@/components/PartPurchaseOrderTable";

export interface PartStockLocationTabProps {
  partId: string;
}

const PartStockLocationTab: React.FC<PartStockLocationTabProps> = ({
  partId,
}) => {
  const stockColumns: TableColumn[] = [
    { key: "site", header: "Site", type: "object", objectIdKey: "site_id" },
    {
      key: "location",
      header: "Location",
      type: "object",
      objectIdKey: "location_id",
    },
    { key: "aisle", header: "Aisle", type: "text" },
    { key: "row", header: "Row", type: "text" },
    { key: "bin", header: "Bin", type: "text" },
    { key: "qty_on_hand", header: "QTY on hand", type: "text" },
  ];

  const openPoColumns: TableColumn[] = [
    { key: "po_number", header: "PO Number", type: "text" },
    {
      key: "vendor",
      header: "Vendor",
      type: "object",
      objectIdKey: "vendor_id",
    },
    { key: "status", header: "Status", type: "text" },
    { key: "order_date", header: "Order Date", type: "date" },
    { key: "expected_date", header: "Expected Date", type: "date" },
    { key: "qty_ordered", header: "Qty Ordered", type: "text" },
    { key: "qty_received", header: "Qty Received", type: "text" },
    { key: "unit_cost", header: "Unit Cost", type: "text" },
    { key: "total_cost", header: "Total Cost", type: "text" },
  ];

  return (
    <div className="tab-content-generic">
      <div className="flex gap-3 h-full">
        <div className="flex-1 min-w-0 flex flex-col">
          <PartStockLocationTable
            endpoint="/parts/locations-on-hand"
            filters={{ part_id: partId, part: partId }} // Add both part_id and part for compatibility
            columns={stockColumns}
            queryKey={["parts", partId, "locations-on-hand"]}
            emptyMessage="No stock locations found"
            className="w-full flex-1 min-h-0 flex flex-col"
            height="100%"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <PartPurchaseOrderTable
            endpoint="/parts/parts"
            columns={openPoColumns}
            queryKey={["purchase-orders", partId]}
            emptyMessage="No open purchase orders found"
            className="w-full flex-1 min-h-0 flex flex-col"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default PartStockLocationTab;
