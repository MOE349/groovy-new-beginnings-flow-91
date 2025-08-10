import React from "react";
import { TableTab } from "@/components/EntityTabs";

export interface WorkOrderLogsTabProps {
  workOrderId: string;
}

const WorkOrderLogsTab: React.FC<WorkOrderLogsTabProps> = ({ workOrderId }) => {
  return (
    <TableTab
      endpoint={`/work-orders/work_order_log?work_order_id=${workOrderId}`}
      columns={[
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
      ]}
      queryKey={["work_order_log", workOrderId]}
      emptyMessage="No log entries found"
      canAdd={false}
      showFilters={false}
    />
  );
};

export default WorkOrderLogsTab;
