import React from "react";
import { TableTab } from "@/components/EntityTabs";
import { FormField } from "@/components/ApiForm";

export interface WorkOrderServicesTabProps {
  workOrderId: string;
}

const WorkOrderServicesTab: React.FC<WorkOrderServicesTabProps> = ({
  workOrderId,
}) => {
  const servicesFormTemplate: FormField[] = [
    {
      name: "work_order",
      type: "input",
      inputType: "hidden",
      required: false,
    },
    {
      name: "total_cost",
      type: "input",
      label: "Total Cost",
      required: true,
      inputType: "text",
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      required: true,
      rows: 3,
    },
  ];

  return (
    <TableTab
      endpoint={`/work-orders/work_order_misc_cost?work_order=${workOrderId}`}
      columns={[
        { key: "total_cost", header: "Total Cost", type: "string" },
        { key: "description", header: "Description", type: "string" },
      ]}
      queryKey={["work_order_misc_cost", workOrderId]}
      emptyMessage="No third-party services found"
      canAdd={true}
      addButtonText="Add Third-party Service"
      addFields={servicesFormTemplate}
      addEndpoint="/work-orders/work_order_misc_cost"
      addInitialData={{ work_order: workOrderId }}
      canEdit={true}
      editFields={servicesFormTemplate}
      editEndpoint={(itemId) => `/work-orders/work_order_misc_cost/${itemId}`}
      editInitialData={(row: Record<string, unknown>) => ({
        ...row,
        work_order: workOrderId,
      })}
    />
  );
};

export default WorkOrderServicesTab;
