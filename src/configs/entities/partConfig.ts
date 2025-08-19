import React from "react";
import { EntityConfig } from "@/templates/EditEntityTemplate";
import { CreateEntityConfig } from "@/templates/CreateEntityTemplate";
import { useQuery } from "@tanstack/react-query";
import { partFields } from "@/data/partFormFields";
import { partFormConfig } from "@/config/formLayouts";
import FormLayout from "@/components/FormLayout";
import type { CustomLayoutProps } from "@/components/ApiForm";
import { GenericTab } from "@/components/EntityTabs";
import ApiTable, { TableColumn } from "@/components/ApiTable";
import { PartStockLocationTable } from "@/components";
import { apiCall } from "@/utils/apis";

// Part data type
interface PartData {
  data: {
    data: {
      id?: string;
      part_number?: string;
      name?: string;
      description?: string;
      last_price?: number;
      make?: string;
      category?: string;
      component?: string;
      [key: string]: unknown;
    };
  };
}

// Shared base configuration
const basePartConfig = {
  entityName: "part",
  entityDisplayName: "Part",
  getFields: () => partFields,
  getCustomLayout:
    (data?: PartData) => (props: CustomLayoutProps<Record<string, unknown>>) =>
      React.createElement(FormLayout, {
        ...props,
        config: partFormConfig,
        initialData: data ? data.data.data : undefined,
        error: null,
      }),
};

// Edit configuration for existing parts
export const partEditConfig: EntityConfig<PartData> = {
  ...basePartConfig,

  useEntityData: (id: string) => {
    const result = useQuery({
      queryKey: ["part", id],
      queryFn: async () => {
        const response = await apiCall(`/parts/parts/${id}`);
        return response.data || response;
      },
      enabled: !!id,
      retry: false,
    });

    return {
      data: result.data ? { data: result.data } : null,
      isLoading: result.isLoading,
      isError: result.isError,
      error: result.error,
    };
  },

  getUpdateEndpoint: (id: string) => `/parts/parts/${id}`,

  getInitialData: (data: PartData) => {
    const part = data.data.data;
    return {
      ...part,
    };
  },

  getTabs: (id: string, data: PartData) => {
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
      { key: "placeholder", header: "-", type: "text" },
    ];

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

    return [
      {
        id: "stock_location",
        label: "Stock/Location",
        content: React.createElement(
          "div",
          { className: "p-4 h-full" },
          React.createElement(
            "div",
            { className: "flex gap-4 h-full" },
            React.createElement(
              "div",
              { className: "flex-1 min-w-0 flex flex-col" },
              React.createElement(PartStockLocationTable, {
                title: "Stock Location",
                endpoint: "/parts/locations-on-hand",
                filters: { part_id: id, part: id }, // Add both part_id and part for compatibility
                columns: stockColumns,
                queryKey: ["parts", id, "locations-on-hand"],
                emptyMessage: "No stock locations found",
                className: "w-full flex-1 min-h-0 flex flex-col",
                height: "100%",
              })
            ),
            React.createElement(
              "div",
              { className: "flex-1 min-w-0 flex flex-col" },
              React.createElement(ApiTable, {
                title: "Open Purchase Orders",
                endpoint: "/parts/inventory-batches",
                filters: { part: id },
                columns: openPoColumns,
                emptyMessage: "Coming soon",
                className: "w-full flex-1 min-h-0 flex flex-col",
                height: "100%",
              })
            )
          )
        ),
      },
      {
        id: "vendors",
        label: "Vendors",
        content: React.createElement(GenericTab, {
          title: "Vendors",
          description: "Vendors and supplier relationships will appear here",
          children: React.createElement(
            "div",
            { className: "p-4" },
            "Placeholder content."
          ),
        }),
      },
      {
        id: "warrenty",
        label: "Warrenty",
        content: React.createElement(GenericTab, {
          title: "Warrenty",
          description: "Warranty details and terms will appear here",
          children: React.createElement(
            "div",
            { className: "p-4" },
            "Placeholder content."
          ),
        }),
      },
      {
        id: "files",
        label: "Files",
        content: React.createElement(GenericTab, {
          title: "Files",
          description: "Attached files and documents will appear here",
          children: React.createElement(
            "div",
            { className: "p-4" },
            "Placeholder content."
          ),
        }),
      },
      {
        id: "log",
        label: "Log",
        content: React.createElement(GenericTab, {
          title: "Log",
          description: "Part movement history",
          children: React.createElement(
            "div",
            { className: "p-4 h-full" },
            React.createElement(ApiTable, {
              endpoint: "/parts/movements",
              filters: { part: id },
              columns: movementColumns,
              queryKey: ["parts", id, "movements"],
              emptyMessage: "No movements found",
              className: "w-full flex-1 min-h-0 flex flex-col",
              height: "100%",
            })
          ),
        }),
      },
    ];
  },

  validateData: (data: PartData) => !!data?.data?.data,

  defaultTab: "stock_location",
};

// Create configuration for new parts
export const partCreateConfig: CreateEntityConfig = {
  ...basePartConfig,

  getCreateEndpoint: () => "/parts/parts",

  getInitialData: () => ({}),

  getEditRoute: (id: string) => `/parts/edit/${id}`,

  getTabs: () => [
    {
      id: "completion",
      label: "Completion",
      content: React.createElement(GenericTab, {
        title: "Completion",
        description: "Completion tracking and details will go here",
        children: React.createElement(
          "div",
          { className: "p-4" },
          "Content will be available after creation."
        ),
      }),
    },
    {
      id: "checklist",
      label: "Checklist",
      content: React.createElement(GenericTab, {
        title: "Checklist",
        description: "Checklist items and progress will go here",
        children: React.createElement(
          "div",
          { className: "p-4" },
          "Content will be available after creation."
        ),
      }),
    },
    {
      id: "parts",
      label: "Parts",
      content: React.createElement(GenericTab, {
        title: "Parts",
        description: "Parts and materials needed will go here",
        children: React.createElement(
          "div",
          { className: "p-4" },
          "Content will be available after creation."
        ),
      }),
    },
    {
      id: "services",
      label: "Third-party services",
      content: React.createElement(GenericTab, {
        title: "Third-party services",
        description: "Third-party services and contractors will go here",
        children: React.createElement(
          "div",
          { className: "p-4" },
          "Content will be available after creation."
        ),
      }),
    },
    {
      id: "files",
      label: "Files",
      content: React.createElement(GenericTab, {
        title: "Files",
        description: "Attached files and documents will go here",
        children: React.createElement(
          "div",
          { className: "p-4" },
          "Content will be available after creation."
        ),
      }),
    },
    {
      id: "log",
      label: "Log",
      content: React.createElement(GenericTab, {
        title: "Log",
        description: "Part activity log will go here",
        children: React.createElement(
          "div",
          { className: "p-4" },
          "Content will be available after creation."
        ),
      }),
    },
  ],

  defaultTab: "completion",
};

// Legacy export for backward compatibility
export const partConfig = partEditConfig;
