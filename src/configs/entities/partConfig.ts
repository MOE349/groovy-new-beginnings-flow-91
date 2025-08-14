import React from "react";
import { EntityConfig } from "@/templates/EditEntityTemplate";
import { CreateEntityConfig } from "@/templates/CreateEntityTemplate";
import { useQuery } from "@tanstack/react-query";
import { partFields } from "@/data/partFormFields";
import { partFormConfig } from "@/config/formLayouts";
import FormLayout from "@/components/FormLayout";
import type { CustomLayoutProps } from "@/components/ApiForm";
import { GenericTab } from "@/components/EntityTabs";
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

  getTabs: (id: string, data: PartData) => [
    {
      id: "completion",
      label: "Completion",
      content: React.createElement(GenericTab, {
        title: "Completion",
        description: "Part completion tracking and details will go here",
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
        description: "Part checklist items and progress will go here",
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
        description: "Related parts and materials will go here",
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
      label: "Logs",
      content: React.createElement(GenericTab, {
        title: "Logs",
        description: "Part activity log will go here",
        children: React.createElement(
          "div",
          { className: "p-4" },
          "Content will be available after creation."
        ),
      }),
    },
  ],

  validateData: (data: PartData) => !!data?.data?.data,

  defaultTab: "completion",
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
