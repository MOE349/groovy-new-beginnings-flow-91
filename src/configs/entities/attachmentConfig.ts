import React from "react";
import { EntityConfig } from "@/templates/EditEntityTemplate";
import { CreateEntityConfig } from "@/templates/CreateEntityTemplate";
import { useAssetData } from "@/hooks/useAssetData";
import { attachmentFields } from "@/data/assetFormFields";
import { attachmentFormConfig } from "@/config/formLayouts";
import FormLayout from "@/components/FormLayout";
import type { CustomLayoutProps } from "@/components/ApiForm";
import {
  AssetMeteringEventsTab,
  AssetScheduledMaintenanceTab,
  AssetLogTab,
  AssetComponentsTab,
  AssetBacklogTab,
} from "@/components/AssetTabs";
import { FilesTab, GenericTab } from "@/components/EntityTabs";
import FinancialsTabContent from "@/components/FinancialsTabContent";
import PartsBomTabContent from "@/components/PartsBomTabContent";

// Shared attachment data type
interface AttachmentData {
  assetType: string;
  assetData: Record<string, unknown>;
}

// Shared base configuration
const baseAttachmentConfig = {
  entityName: "attachment",
  entityDisplayName: "Attachment",
  getFields: () => attachmentFields,
  getCustomLayout: () => (props: CustomLayoutProps<Record<string, unknown>>) =>
    React.createElement(FormLayout, {
      ...props,
      config: attachmentFormConfig,
      error: null,
    }),
};

// Edit configuration for existing attachments
export const attachmentEditConfig: EntityConfig<AttachmentData> = {
  ...baseAttachmentConfig,

  // Use existing asset data hook but filter for attachments
  useEntityData: (id: string) => {
    const result = useAssetData(id);
    return {
      data:
        result.assetType === "attachment"
          ? { assetType: result.assetType, assetData: result.assetData }
          : null,
      isLoading: result.isLoading,
      isError: result.isError,
      error: result.error,
    };
  },

  // Attachment-specific endpoint for updates
  getUpdateEndpoint: (id: string) => `/assets/attachments/${id}`,

  // Attachment-specific data transformation for editing
  getInitialData: (data: AttachmentData) => {
    const assetData = data.assetData as Record<string, any>;
    return {
      ...assetData,
      category: assetData?.category?.id || assetData?.category || "",
      location: assetData?.location?.id || assetData?.location || "",
      weight_class:
        assetData?.weight_class?.id || assetData?.weight_class || "",
      year: assetData?.year ? String(assetData.year) : "",
      equipment: assetData?.equipment?.id || assetData?.equipment || "",
      project: assetData?.project?.id || assetData?.project || "",
      account_code:
        assetData?.account_code?.id || assetData?.account_code || "",
      job_code: assetData?.job_code?.id || assetData?.job_code || "",
      asset_status:
        assetData?.asset_status?.id || assetData?.asset_status || "",
    };
  },

  // Attachment-specific tabs for editing (real content)
  getTabs: (id: string) => [
    {
      id: "metering-events",
      label: "Metering/Events",
      content: React.createElement(AssetMeteringEventsTab, { assetId: id }),
    },
    {
      id: "scheduled-maintenance",
      label: "Scheduled Maintenance",
      content: React.createElement(AssetScheduledMaintenanceTab, {
        assetId: id,
      }),
    },
    {
      id: "parts-bom",
      label: "Parts/BOM",
      content: React.createElement(PartsBomTabContent, { assetId: id }),
    },
    {
      id: "financials",
      label: "Financials",
      content: React.createElement(FinancialsTabContent, { assetId: id }),
    },
    {
      id: "files",
      label: "Files",
      content: React.createElement(FilesTab, {
        linkToModel: "assets.attachment",
        linkToId: id,
        maxSize: 25,
      }),
    },
    {
      id: "backlog",
      label: "Backlog",
      content: React.createElement(AssetBacklogTab, { assetId: id }),
    },
    {
      id: "components",
      label: "Components",
      content: React.createElement(AssetComponentsTab, { assetId: id }),
    },
    {
      id: "log",
      label: "Log",
      content: React.createElement(AssetLogTab, { assetId: id }),
    },
  ],

  onMount: () => {
    // Prefetch logic will be handled at the component level
  },

  validateData: (data: AttachmentData) =>
    data.assetType === "attachment" && !!data.assetData,

  defaultTab: "metering-events",
};

// Create configuration for new attachments
export const attachmentCreateConfig: CreateEntityConfig = {
  ...baseAttachmentConfig,

  // Attachment-specific endpoint for creation
  getCreateEndpoint: () => "/assets/attachments",

  // Attachment-specific initial data for creation
  getInitialData: () => ({ is_online: false }),

  // Attachment-specific edit route after creation
  getEditRoute: (id: string) => `/asset/edit/${id}`,

  // Attachment-specific tabs for creation (placeholder content)
  getTabs: () => [
    {
      id: "parts-bom",
      label: "Parts/BOM",
      content: React.createElement(GenericTab, {
        title: "Parts/BOM",
        description: "Parts and Bill of Materials content will go here",
        children: React.createElement(
          "div",
          { className: "p-4" },
          "Content will be available after creation."
        ),
      }),
    },
    {
      id: "metering-events",
      label: "Metering/Events",
      content: React.createElement(GenericTab, {
        title: "Metering/Events",
        description:
          "Create the attachment first, then add meter readings in the edit view.",
        children: React.createElement(
          "div",
          {
            className: "p-4 flex items-center justify-center min-h-[200px]",
          },
          "Meter readings will be available in the edit view."
        ),
      }),
    },
    {
      id: "scheduled-maintenance",
      label: "Scheduled Maintenance",
      content: React.createElement(GenericTab, {
        title: "Scheduled Maintenance",
        description: "Scheduled maintenance content will go here",
        children: React.createElement(
          "div",
          { className: "p-4" },
          "Content will be available after creation."
        ),
      }),
    },
    {
      id: "financials",
      label: "Financials",
      content: React.createElement(GenericTab, {
        title: "Financials",
        description: "Financial information content will go here",
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
        description: "File attachments and documents will go here",
        children: React.createElement(
          "div",
          { className: "p-4" },
          "Content will be available after creation."
        ),
      }),
    },
    {
      id: "backlog",
      label: "Backlog",
      content: React.createElement(GenericTab, {
        title: "Backlog",
        description: "Backlog items and tasks will go here",
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
        description: "Activity log content will go here",
        children: React.createElement(
          "div",
          { className: "p-4" },
          "Content will be available after creation."
        ),
      }),
    },
  ],

  defaultTab: "parts-bom",
};

// Legacy export for backward compatibility
export const attachmentConfig = attachmentEditConfig;
