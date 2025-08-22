import React from "react";
import { QuadApiTableTab, QuadTableConfig } from "@/components/EntityTabs";

export interface AssetLogTabProps {
  assetId: string;
}

const AssetLogTab: React.FC<AssetLogTabProps> = ({ assetId }) => {
  // Page 1 - Top Left Table
  const topLeftTable: QuadTableConfig = {
    endpoint: `/assets/movement-log?asset=${assetId}`,
    columns: [
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
    ],
    tableId: `asset-movement-log-${assetId}`,
    queryKey: ["asset-movement-log", assetId],
    title: "Asset Move History",
    maxHeight: "max-h-[400px]",
    hasCreateButton: false,
    persistColumnOrder: false,
    enableColumnReorder: false,
  };

  // Page 1 - Top Right Table
  const topRightTable: QuadTableConfig = {
    endpoint: `/assets/online-status-log?asset=${assetId}`,
    columns: [
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
    ],
    tableId: `asset-online-status-log-${assetId}`,
    queryKey: ["asset-online-status-log", assetId],
    title: "Asset Offline History",
    maxHeight: "max-h-[400px]",
    hasCreateButton: false,
    persistColumnOrder: false,
    enableColumnReorder: false,
  };

  // Page 2 - Bottom Left Table
  const bottomLeftTable: QuadTableConfig = {
    endpoint: `/work-orders/work_order?asset=${assetId}&status__control__name__in=Active,Draft,Pending`,
    columns: [
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
          value ? new Date(value + "T00:00:00").toLocaleDateString() : "-",
      },
    ],
    tableId: `active-work-orders-${assetId}`,
    queryKey: ["active-work-orders", assetId],
    title: "Active Work Orders",
    editRoutePattern: "/workorders/edit/{id}",
    maxHeight: "max-h-[400px]",
    showFilters: false,
    hasCreateButton: false,
    persistColumnOrder: false,
    enableColumnReorder: false,
  };

  // Page 2 - Bottom Right Table
  const bottomRightTable: QuadTableConfig = {
    endpoint: `/work-orders/work_order?asset=${assetId}&status__control__name=Closed`,
    columns: [
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
          value ? new Date(value + "T00:00:00").toLocaleDateString() : "-",
      },
    ],
    tableId: `completed-work-orders-${assetId}`,
    queryKey: ["completed-work-orders", assetId],
    title: "Completed Work Orders",
    editRoutePattern: "/workorders/edit/{id}",
    maxHeight: "max-h-[400px]",
    hasCreateButton: false,
    persistColumnOrder: false,
    enableColumnReorder: false,
  };

  return (
    <QuadApiTableTab
      assetId={assetId}
      topLeftTable={topLeftTable}
      topRightTable={topRightTable}
      bottomLeftTable={bottomLeftTable}
      bottomRightTable={bottomRightTable}
    />
  );
};

export default AssetLogTab;
