import React from "react";
import { TableTab } from "@/components/EntityTabs";
import { TableColumn } from "@/components/ApiTable";
import { FormField } from "@/components/ApiForm";
import { DropdownField } from "@/components/ApiForm/fields/DropdownField";
import { InputField } from "@/components/ApiForm/fields/InputField";
import { transformFormData } from "@/components/ApiForm/utils/validation";

export interface AssetComponentsTabProps {
  assetId: string;
}

const AssetComponentsTab: React.FC<AssetComponentsTabProps> = ({ assetId }) => {
  // Define table columns
  const columns: TableColumn[] = [
    { key: "name", header: "Name", type: "string" },
    {
      key: "work_order",
      header: "Work Order",
      type: "object",
      render: (value) => value?.code || value?.name || value?.id || "-",
    },
    {
      key: "changed_at_meter_reading",
      header: "Changed at Meter Reading",
      type: "number",
      render: (value) => (value != null ? value.toString() : "-"),
    },
    {
      key: "initial_meter_reading",
      header: "Initial Meter Reading",
      type: "number",
      render: (value) => (value != null ? value.toString() : "-"),
    },
    {
      key: "component_meter_reading",
      header: "Component Meter Reading",
      type: "number",
      render: (value) => (value != null ? value.toString() : "-"),
    },
    {
      key: "warranty_meter_reading",
      header: "Warranty Meter Reading",
      type: "number",
      render: (value) => (value != null ? value.toString() : "-"),
    },
    { key: "warranty_exp_date", header: "Warranty Exp Date", type: "date" },
    {
      key: "is_warranty_expired",
      header: "Warranty Expired",
      type: "bool",
      render: (value) => (value ? "Yes" : "No"),
    },
  ];

  // Define form fields for add/edit
  const getFormFields = (editingItemId?: string): FormField[] => [
    { name: "name", label: "Name", type: "input", required: true },
    {
      name: "work_order",
      label: "Work Order",
      type: "dropdown",
      endpoint: `/work-orders/work_order?asset=${assetId}&created_at__gt=${
        new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      }`,
      queryKey: ["work_orders", "by_asset", assetId],
      optionValueKey: "id",
      optionLabelKey: "code",
    },
    {
      name: "changed_at_meter_reading",
      label: "Changed at Meter Reading",
      type: "input",
      inputType: "number",
    },
    {
      name: "initial_meter_reading",
      label: "Initial Meter Reading",
      type: "input",
      inputType: "number",
    },
    {
      name: "component_meter_reading",
      label: "Component Meter Reading",
      type: "input",
      inputType: "number",
      disabled: true,
    },
    {
      name: "warranty_meter_reading",
      label: "Warranty Meter Reading",
      type: "input",
      inputType: "number",
    },
    {
      name: "warranty_exp_date",
      label: "Warranty Exp Date",
      type: "datepicker",
    },
    ...(editingItemId
      ? [
          {
            name: "files",
            label: "Files",
            type: "file_manager" as const,
            linkToModel: "components.component",
            linkToId: editingItemId,
          },
        ]
      : []),
  ];

  return (
    <TableTab
      endpoint="/components/component/"
      filters={{ asset: assetId }}
      columns={columns}
      queryKey={["components", assetId]}
      emptyMessage="No components found"
      showFilters={false}
      height="100%"
      canAdd={true}
      addButtonText="New Component"
      addFields={getFormFields()}
      addEndpoint="/components/component/"
      addInitialData={{ asset: assetId }}
      canEdit={true}
      editFields={getFormFields("placeholder")} // Will be updated with actual ID
      editEndpoint={(id) => `/components/component/${id}`}
      editInitialData={(row) => ({
        ...row,
        // Ensure dates are properly formatted for the form
        warranty_exp_date: row.warranty_exp_date || "",
      })}
    />
  );
};

export default AssetComponentsTab;
