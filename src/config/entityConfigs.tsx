import React from "react";
import { EntityConfig } from "@/types/entityConfig";
import { equipmentFields, attachmentFields } from "@/data/assetFormFields";
import { workOrderFields } from "@/data/workOrderFormFields";
import { siteFormFields, locationFormFields } from "@/data/siteFormFields";
import { equipmentCategoryFormFields, attachmentCategoryFormFields } from "@/data/categoryFormFields";
import AssetFormLayout from "@/components/AssetFormLayout";
import { AttachmentFormLayout } from "@/components/AttachmentFormLayout";

const commonAssetTabs = [
  { key: "parts", label: "Parts/BOM" },
  { key: "metering", label: "Metering/Events" },
  { key: "maintenance", label: "Scheduled Maintenance" },
  { key: "financials", label: "Financials" },
  { key: "files", label: "Files" },
  { key: "backlog", label: "Backlog" },
  { key: "log", label: "Log" },
];

const workOrderTabs = [
  { key: "details", label: "Details" },
  { key: "labor", label: "Labor" },
  { key: "parts", label: "Parts" },
  { key: "costs", label: "Costs" },
  { key: "files", label: "Files" },
  { key: "log", label: "Log" },
];

export const entityConfigs: Record<string, EntityConfig> = {
  assets: {
    name: "Asset",
    pluralName: "Assets",
    fields: [], // Will be determined by type selection
    createEndpoint: "", // Will be determined by type selection
    updateEndpoint: (id: string) => `/assets/{type}/${id}`, // Will be replaced based on type
    listRoute: "/asset",
    typeSelection: {
      enabled: true,
      types: [
        {
          key: "equipment",
          label: "Equipment",
          buttonText: "Create Equipment",
          fields: equipmentFields,
          endpoint: "/assets/equipments"
        },
        {
          key: "attachment", 
          label: "Attachment",
          buttonText: "Create Attachment",
          fields: attachmentFields,
          endpoint: "/assets/attachments"
        }
      ]
    },
    customLayout: (props) => {
      const assetType = props.entityType;
      if (assetType === "equipment") {
        return <AssetFormLayout 
          handleSubmit={() => props.handleSubmit(new Event('submit') as any)}
          formData={props.formData}
          handleFieldChange={props.handleFieldChange}
          loading={props.loading}
          error={props.error}
          renderField={props.renderField}
          assetType="equipment"
          assetTypeName="Equipment"
        />;
      } else if (assetType === "attachment") {
        return <AttachmentFormLayout 
          handleSubmit={props.handleSubmit}
          formData={props.formData}
          handleFieldChange={props.handleFieldChange}
          loading={props.loading}
          error={props.error}
          renderField={props.renderField}
        />;
      }
      return null;
    },
    tabs: commonAssetTabs
  },

  "work-orders": {
    name: "Work Order",
    pluralName: "Work Orders", 
    fields: workOrderFields,
    createEndpoint: "/work-orders/work_order",
    updateEndpoint: (id: string) => `/work-orders/work_order/${id}`,
    listRoute: "/workorders",
    tabs: workOrderTabs
  },

  sites: {
    name: "Site",
    pluralName: "Sites",
    fields: siteFormFields,
    createEndpoint: "/company/sites",
    updateEndpoint: (id: string) => `/company/sites/${id}`,
    listRoute: "/settings"
  },

  locations: {
    name: "Location", 
    pluralName: "Locations",
    fields: locationFormFields,
    createEndpoint: "/company/locations",
    updateEndpoint: (id: string) => `/company/locations/${id}`,
    listRoute: "/settings"
  },

  "equipment-categories": {
    name: "Equipment Category",
    pluralName: "Equipment Categories", 
    fields: equipmentCategoryFormFields,
    createEndpoint: "/assets/equipment_category",
    updateEndpoint: (id: string) => `/assets/equipment_category/${id}`,
    listRoute: "/settings"
  },

  "attachment-categories": {
    name: "Attachment Category",
    pluralName: "Attachment Categories",
    fields: attachmentCategoryFormFields,
    createEndpoint: "/assets/attachment_category",
    updateEndpoint: (id: string) => `/assets/attachment_category/${id}`,
    listRoute: "/settings"
  }
};