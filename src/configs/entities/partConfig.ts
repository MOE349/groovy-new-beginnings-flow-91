import React from "react";
import { EntityConfig } from "@/templates/EditEntityTemplate";
import { CreateEntityConfig } from "@/templates/CreateEntityTemplate";
import { useQuery } from "@tanstack/react-query";
import { partFields } from "@/data/partFormFields";
import { partFormConfig } from "@/config/formLayouts";
import FormLayout from "@/components/FormLayout";
import type { CustomLayoutProps } from "@/components/ApiForm";
import { GenericTab } from "@/components/EntityTabs";
import {
  PartStockLocationTab,
  PartVendorsTab,
  PartWarrantyTab,
  PartFilesTab,
  PartLogTab,
  PartCreateCompletionTab,
  PartCreateChecklistTab,
  PartCreatePartsTab,
  PartCreateServicesTab,
  PartCreateFilesTab,
  PartCreateLogTab,
} from "@/components/PartTabs";
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
    return [
      {
        id: "stock_location",
        label: "Stock/Location",
        content: React.createElement(PartStockLocationTab, { partId: id }),
      },
      {
        id: "vendors",
        label: "Vendors",
        content: React.createElement(PartVendorsTab, { partId: id }),
      },
      {
        id: "warranty",
        label: "Warranty",
        content: React.createElement(PartWarrantyTab, { partId: id }),
      },
      {
        id: "files",
        label: "Files",
        content: React.createElement(PartFilesTab, { partId: id }),
      },
      {
        id: "log",
        label: "Log",
        content: React.createElement(PartLogTab, { partId: id }),
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
      content: React.createElement(PartCreateCompletionTab),
    },
    {
      id: "checklist",
      label: "Checklist",
      content: React.createElement(PartCreateChecklistTab),
    },
    {
      id: "parts",
      label: "Parts",
      content: React.createElement(PartCreatePartsTab),
    },
    {
      id: "services",
      label: "Third-party services",
      content: React.createElement(PartCreateServicesTab),
    },
    {
      id: "files",
      label: "Files",
      content: React.createElement(PartCreateFilesTab),
    },
    {
      id: "log",
      label: "Log",
      content: React.createElement(PartCreateLogTab),
    },
  ],

  defaultTab: "completion",
};

// Legacy export for backward compatibility
export const partConfig = partEditConfig;
