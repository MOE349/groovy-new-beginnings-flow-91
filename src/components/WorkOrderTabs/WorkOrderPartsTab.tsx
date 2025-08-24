import React from "react";
import { TableTab } from "@/components/EntityTabs";
import { FormField } from "@/components/ApiForm";

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

  return (
    <>


      <TableTab
        endpoint={`/parts/work-order-parts?work_order=${workOrderId}`}
        columns={[
          {
            key: "part_number",
            header: "Part Number",
            type: "object",
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
            type: "object",
            render: (value: unknown, row: Record<string, unknown>) => {
              const partObj = row.part;
              if (!partObj) return "—";
              const part =
                typeof partObj === "object" && partObj !== null
                  ? (partObj as Record<string, unknown>)
                  : {};
              const partName = (part.name as string) || "—";
              return <span>{partName}</span>;
            },
          },
          { key: "qty_used", header: "QTY", type: "string" },
        ]}
        queryKey={["work_order_parts", workOrderId]}
        emptyMessage="No parts assigned to this work order"
        canAdd={!isReadOnly}
        addButtonText="Add Part"
        addFields={partsFormTemplate}
        addEndpoint="/parts/work-order-parts"
        addInitialData={{ work_order: workOrderId }}
        canEdit={true}
        editReadOnly={isReadOnly}
        editFields={partsFormTemplate}
        editEndpoint={(itemId) => `/parts/work-order-parts/${itemId}`}
        editInitialData={(row: Record<string, unknown>) => ({
          ...row,
          work_order: workOrderId,
          part:
            typeof row.part === "object" && row.part
              ? (row.part as Record<string, unknown>)?.id
              : row.part,
        })}
      />
    </>
  );
};

export default WorkOrderPartsTab;
