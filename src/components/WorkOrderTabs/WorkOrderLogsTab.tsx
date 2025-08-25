import React from "react";
import { DualApiTableTab } from "@/components/EntityTabs";
import type { TableColumn } from "@/components/ApiTable/types";

export interface WorkOrderLogsTabProps {
  workOrderId: string;
  isReadOnly?: boolean;
}

const WorkOrderLogsTab: React.FC<WorkOrderLogsTabProps> = ({
  workOrderId,
  isReadOnly = false,
}) => {
  const movementColumns: TableColumn[] = [
    {
      key: "created_by",
      header: "Created By",
      type: "object",
      objectIdKey: "created_by_id",
    },
    { key: "movement_type", header: "Movement Type", type: "text" },
    { key: "qty_delta", header: "Qty Delta", type: "text" },
    {
      key: "work_order",
      header: "Work Order",
      type: "object",
      objectIdKey: "work_order_id",
    },
    { key: "receipt_id", header: "Receipt ID", type: "text" },
    { key: "total_price", header: "Total Price", type: "text" },
  ];

  return (
    <>
      <DualApiTableTab
        assetId={workOrderId}
        leftTable={{
          title: "Work Order Logs",
          endpoint: `/work-orders/work_order_log?work_order_id=${workOrderId}`,
          columns: [
            { key: "user", header: "User", type: "object" },
            { key: "amount", header: "Amount", type: "string" },
            { key: "log_type", header: "Log Type", type: "string" },
            { key: "description", header: "Description", type: "string" },
            {
              key: "created_at",
              header: "Date",
              type: "date",
              render: (value: string | null | undefined) => {
                if (!value) return "";
                const date = new Date(value);
                return date.toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                });
              },
            },
          ],
          tableId: `work-order-logs-${workOrderId}`,
          queryKey: ["work_order_log", workOrderId],
          emptyMessage: "No log entries found",
          hasCreateButton: false,
          enableColumnReorder: false,
        }}
        rightTable={{
          title: "Part Movement Log",
          endpoint: `/parts/work-order-parts-log`,
          columns: movementColumns,
          tableId: `part-movement-logs-${workOrderId}`,
          queryKey: ["part_movement", workOrderId],
          filters: { work_order: workOrderId },
          emptyMessage: "No part movement entries found",
          hasCreateButton: false,
          enableColumnReorder: false,
        }}
      />
    </>
  );
};

export default WorkOrderLogsTab;
