import React from "react";
import { EntityConfig } from "@/templates/EditEntityTemplate";
import { CreateEntityConfig } from "@/templates/CreateEntityTemplate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workOrderFields } from "@/data/workOrderFormFields";
import { workOrderFormConfig } from "@/config/formLayouts";
import FormLayout from "@/components/FormLayout";
import type { CustomLayoutProps } from "@/components/ApiForm";
import {
  WorkOrderCompletionTab,
  WorkOrderChecklistTab,
  WorkOrderPartsTab,
  WorkOrderServicesTab,
  WorkOrderFilesTab,
  WorkOrderLogsTab,
} from "@/components/WorkOrderTabs";
import { GenericTab } from "@/components/EntityTabs";
import { apiCall } from "@/utils/apis";

// Work order data type
interface WorkOrderData {
  data: {
    data: {
      id?: string;
      is_closed?: boolean;
      updated_at?: string;
      asset?: {
        id?: string;
        is_online?: boolean;
        location?: {
          id?: string;
          name?: string;
        };
      };
      priority?: { id?: string } | string;
      status?: { id?: string } | string;
      location?: { id?: string } | string;
      assigned_to?: { id?: string } | string;
      category?: { id?: string } | string;
      work_type?: { id?: string } | string;
      maint_type?: { id?: string } | string;
      [key: string]: unknown;
    };
  };
}

// Shared base configuration
const baseWorkOrderConfig = {
  entityName: "work_order",
  entityDisplayName: "Work Order",
  getFields: () => workOrderFields,
  getCustomLayout:
    (data?: WorkOrderData) =>
    (props: CustomLayoutProps<Record<string, unknown>>) =>
      React.createElement(FormLayout, {
        ...props,
        config: workOrderFormConfig,
        initialData: data ? data.data.data : undefined,
        error: null,
        // Pass work order closed status and ID for reopen functionality
        workOrderId: data?.data?.data?.id,
        isWorkOrderClosed: data?.data?.data?.is_closed || false,
      }),
};

// Edit configuration for existing work orders
export const workOrderEditConfig: EntityConfig<WorkOrderData> = {
  ...baseWorkOrderConfig,

  useEntityData: (id: string) => {
    const result = useQuery({
      queryKey: ["work_order", id],
      queryFn: async () => {
        const response = await apiCall(`/work-orders/work_order/${id}`);
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

  getUpdateEndpoint: (id: string) => `/work-orders/work_order/${id}`,

  getInitialData: (data: WorkOrderData) => {
    const workOrder = data.data.data;
    // Extract asset data from the API response
    const assetIsOnline = workOrder?.asset?.is_online;
    const assetLocation = workOrder?.asset?.location?.name;

    return {
      ...workOrder,
      priority:
        typeof workOrder?.priority === "object"
          ? workOrder.priority?.id
          : workOrder?.priority || "",
      status:
        typeof workOrder?.status === "object"
          ? workOrder.status?.id
          : workOrder?.status || "",
      asset:
        typeof workOrder?.asset === "object"
          ? workOrder.asset?.id
          : workOrder?.asset || "",
      location:
        typeof workOrder?.location === "object"
          ? workOrder.location?.id
          : workOrder?.location || "",
      assigned_to:
        typeof workOrder?.assigned_to === "object"
          ? workOrder.assigned_to?.id
          : workOrder?.assigned_to || "",
      category:
        typeof workOrder?.category === "object"
          ? workOrder.category?.id
          : workOrder?.category || "",
      work_type:
        typeof workOrder?.work_type === "object"
          ? workOrder.work_type?.id
          : workOrder?.work_type || "",
      maint_type:
        typeof workOrder?.maint_type === "object"
          ? workOrder.maint_type?.id
          : workOrder?.maint_type || "",
      // Extract asset online status for the toggle
      asset__is_online: assetIsOnline,
      is_online: assetIsOnline,
      // Extract asset location for display
      asset_location: assetLocation,
    };
  },

  getTabs: (id: string, data: WorkOrderData) => {
    const isReadOnly = data?.data?.data?.is_closed || false;
    return [
      {
        id: "completion",
        label: "Completion",
        content: React.createElement(WorkOrderCompletionTab, {
          workOrderId: id,
          isReadOnly,
        }),
      },
      {
        id: "checklist",
        label: "Checklist",
        content: React.createElement(WorkOrderChecklistTab, {
          workOrderId: id,
          isReadOnly,
        }),
      },
      {
        id: "parts",
        label: "Parts",
        content: React.createElement(WorkOrderPartsTab, {
          workOrderId: id,
          isReadOnly,
        }),
      },
      {
        id: "services",
        label: "Third-party services",
        content: React.createElement(WorkOrderServicesTab, {
          workOrderId: id,
          isReadOnly,
        }),
      },
      {
        id: "files",
        label: "Files",
        content: React.createElement(WorkOrderFilesTab, {
          workOrderId: id,
          isReadOnly,
        }),
      },
      {
        id: "log",
        label: "Logs",
        content: React.createElement(WorkOrderLogsTab, {
          workOrderId: id,
          isReadOnly,
        }),
      },
    ];
  },

  validateData: (data: WorkOrderData) => !!data?.data?.data,

  defaultTab: "completion",
};

// Create configuration for new work orders
export const workOrderCreateConfig: CreateEntityConfig = {
  ...baseWorkOrderConfig,

  getCreateEndpoint: () => "/work-orders/work_order",

  getInitialData: () => ({}),

  getEditRoute: (id: string) => `/workorders/edit/${id}`,

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
        description: "Work order activity log will go here",
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
export const workOrderConfig = workOrderEditConfig;
