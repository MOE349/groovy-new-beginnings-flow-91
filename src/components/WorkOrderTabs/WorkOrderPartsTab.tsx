import React from "react";
import { TableTab } from "@/components/EntityTabs";
import { FormField } from "@/components/ApiForm";
import {
  InlineEditableApiTable,
  EditableTableColumn,
} from "@/components/InlineEditableApiTable";

export interface WorkOrderPartsTabProps {
  workOrderId: string;
  isReadOnly?: boolean;
}

const WorkOrderPartsTab: React.FC<WorkOrderPartsTabProps> = ({
  workOrderId,
  isReadOnly = false,
}) => {
  const partsFormTemplate: FormField[] = [
    {
      name: "work_order",
      type: "input",
      inputType: "hidden",
      required: false,
    },
    {
      name: "part",
      type: "dropdown",
      label: "Part",
      required: true,
      endpoint: "/parts/parts",
      queryKey: ["parts_parts"],
      optionValueKey: "id",
      optionLabelKey: "name",
    },
    {
      name: "qty_used",
      type: "input",
      inputType: "number",
      label: "QTY Used",
      required: true,
    },
  ];

  // Define columns for the inline editable table
  const columns: EditableTableColumn[] = [
    {
      key: "part_number",
      header: "Part Number",
      type: "object",
      editable: false, // Not editable
      render: (value: unknown, row: Record<string, unknown>) => {
        const partObj = row.part;
        if (!partObj) return "—";
        const part =
          typeof partObj === "object" && partObj !== null
            ? (partObj as Record<string, unknown>)
            : {};
        const partNumber =
          (part.part_number as string) || (part.number as string) || "—";
        return <span className="font-medium">{partNumber}</span>;
      },
    },
    {
      key: "part_name",
      header: "Part Name",
      type: "string",
      editable: false, // Not editable
      render: (value: unknown, row: Record<string, unknown>) => {
        const partName = (row.part_name as string) || "—";
        return <span>{partName}</span>;
      },
    },
    {
      key: "qty_used",
      header: "QTY",
      type: "string",
      editable: !isReadOnly, // Only editable if not read-only
      editType: "number",
      validate: (value: string | number) => {
        const numValue =
          typeof value === "number" ? value : parseFloat(String(value));
        if (isNaN(numValue)) {
          return "Must be a valid number";
        }
        if (numValue < 0) {
          return "Quantity cannot be negative";
        }
        return null; // Valid
      },
    },
  ];

  return (
    <>
      <InlineEditableApiTable
        endpoint={`/parts/work-order-parts?work_order=${workOrderId}`}
        columns={columns}
        queryKey={["work_order_parts", workOrderId]}
        emptyMessage="No parts assigned to this work order"
        updateEndpoint={(itemId) => `/parts/work-order-parts/${itemId}`}
        updateMode="field"
        hasCreateButton={!isReadOnly}
        createNewText="Add Part"
        onCreateNew={() => {
          // This would need to be implemented - for now, keeping the original functionality
          // We could either open a dialog or redirect to add form
          console.log("Add Part clicked - need to implement");
        }}
        onCellUpdate={(rowId, columnKey, newValue, updatedRow) => {
          console.log(`Updated ${columnKey} for row ${rowId}:`, newValue);
        }}
        onCellUpdateError={(rowId, columnKey, error) => {
          console.error(
            `Failed to update ${columnKey} for row ${rowId}:`,
            error
          );
        }}
      />
    </>
  );
};

export default WorkOrderPartsTab;
