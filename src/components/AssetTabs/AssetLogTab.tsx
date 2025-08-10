import React from "react";
import { ApiTable } from "@/components/ApiTable";

export interface AssetLogTabProps {
  assetId: string;
}

const AssetLogTab: React.FC<AssetLogTabProps> = ({ assetId }) => {
  return (
    <div className="space-y-3 h-full overflow-y-auto">
      <div>
        <h3 className="text-sm font-semibold mb-2">Asset Move History</h3>
        <ApiTable
          endpoint={`/assets/movement-log?asset=${assetId}`}
          columns={[
            {
              key: "from_location",
              header: "From Location",
              type: "object",
            },
            {
              key: "to_location",
              header: "To Location",
              type: "object",
            },
            {
              key: "moved_by",
              header: "Moved By",
              type: "object",
            },
            {
              key: "timestamp",
              header: "Moved At",
              type: "date",
            },
          ]}
          queryKey={["asset-movement-log", assetId]}
          tableId={`asset-movement-log-${assetId}`}
          maxHeight="max-h-[200px]"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Asset Offline History</h3>
        <ApiTable
          endpoint={`/assets/online-status-log?asset=${assetId}`}
          columns={[
            {
              key: "online_user",
              header: "Online User",
              type: "object",
            },
            {
              key: "created_at",
              header: "From",
              type: "datetime",
            },
            {
              key: "offline_user",
              header: "Offline User",
              type: "object",
            },
            { key: "updated_at", header: "To", type: "datetime" },
            {
              key: "work_order",
              header: "Work Order",
              type: "object",
            },
          ]}
          queryKey={["asset-online-status-log", assetId]}
          tableId={`asset-online-status-log-${assetId}`}
          maxHeight="max-h-[200px]"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Active Work Orders</h3>
        <ApiTable
          endpoint={`/work-orders/work_order?asset=${assetId}&status__control__name__in=Active,Draft,Pending`}
          columns={[
            { key: "code", header: "Code", type: "string" },
            {
              key: "description",
              header: "Description",
              type: "string",
            },
            {
              key: "status",
              header: "Status",
              type: "object",
              render: (value: unknown): React.ReactNode => {
                const status = value as Record<string, unknown>;
                return String(
                  (status?.control as Record<string, unknown>)?.name ||
                    status?.name ||
                    "-"
                );
              },
            },
            {
              key: "maint_type",
              header: "Maint Type",
              type: "string",
            },
            {
              key: "completion_end_date",
              header: "Completion Date",
              type: "string",
              render: (value: string | null | undefined) =>
                value
                  ? new Date(value + "T00:00:00").toLocaleDateString()
                  : "-",
            },
          ]}
          queryKey={["active-work-orders", assetId]}
          tableId={`active-work-orders-${assetId}`}
          editRoutePattern="/workorders/edit/{id}"
          maxHeight="max-h-[200px]"
          showFilters={false}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Completed Work Orders</h3>
        <ApiTable
          endpoint={`/work-orders/work_order?asset=${assetId}&status__control__name=Closed`}
          columns={[
            { key: "code", header: "Code", type: "string" },
            {
              key: "description",
              header: "Description",
              type: "string",
            },
            {
              key: "status",
              header: "Status",
              type: "object",
              render: (value: unknown): React.ReactNode => {
                const status = value as Record<string, unknown>;
                return String(
                  (status?.control as Record<string, unknown>)?.name ||
                    status?.name ||
                    "-"
                );
              },
            },
            {
              key: "maint_type",
              header: "Maint Type",
              type: "string",
            },
            {
              key: "completion_end_date",
              header: "Completion Date",
              type: "string",
              render: (value: string | null | undefined) =>
                value
                  ? new Date(value + "T00:00:00").toLocaleDateString()
                  : "-",
            },
          ]}
          queryKey={["completed-work-orders", assetId]}
          tableId={`completed-work-orders-${assetId}`}
          editRoutePattern="/workorders/edit/{id}"
          maxHeight="max-h-[200px]"
        />
      </div>
    </div>
  );
};

export default AssetLogTab;
