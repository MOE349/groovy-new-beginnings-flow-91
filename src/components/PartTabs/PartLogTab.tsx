import React from "react";
import { TableColumn } from "@/components/ApiTable";
import { TableTab } from "@/components/EntityTabs";

export interface PartLogTabProps {
  partId: string;
}

const PartLogTab: React.FC<PartLogTabProps> = ({ partId }) => {
  const movementColumns: TableColumn[] = [
    {
      key: "created_by",
      header: "Created By",
      type: "object",
      objectIdKey: "created_by_id",
    },
    { key: "movement_type", header: "Movement Type", type: "text" },
    {
      key: "from_location",
      header: "From Location",
      type: "object",
      objectIdKey: "from_location_id",
    },
    {
      key: "to_location",
      header: "To Location",
      type: "object",
      objectIdKey: "to_location_id",
    },
    { key: "qty_delta", header: "Qty Delta", type: "text" },
    {
      key: "work_order",
      header: "Work Order",
      type: "object",
      objectIdKey: "work_order_id",
    },
    { key: "receipt_id", header: "Receipt ID", type: "text" },
  ];

  return (
    <TableTab
      hasCreateButton={false}
      title="Part movement history"
      endpoint="/parts/movements"
      filters={{ part: partId }}
      columns={movementColumns}
      queryKey={["parts", partId, "movements"]}
      emptyMessage="No movements found"
      height="100%"
      enableColumnReorder={false}
    />
  );
};

export default PartLogTab;
