import React from "react";
import { TableTab } from "@/components/EntityTabs";
import { FormField } from "@/components/ApiForm";

export interface WorkOrderServicesTabProps {
  workOrderId: string;
  isReadOnly?: boolean;
}

const WorkOrderServicesTab: React.FC<WorkOrderServicesTabProps> = ({
  workOrderId,
  isReadOnly = false,
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
    {
      name: "files",
      label: "Files",
      type: "file_manager",
      linkToModel: "work_orders.workordermisccost",
      linkToId: undefined, // Will be set dynamically for edit
    },
  ];

  return (
    <>
      {/* Read-only indicator */}
      {isReadOnly && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4 mx-4 mt-4">
          <div className="flex items-center">
            <div className="text-orange-600 text-sm font-medium">
              🔒 This work order is closed. All data is read-only.
            </div>
          </div>
        </div>
      )}

      <TableTab
        hasCreateButton={!isReadOnly}
        endpoint={`/work-orders/work_order_misc_cost?work_order=${workOrderId}`}
        columns={[
          { key: "total_cost", header: "Total Cost", type: "string" },
          { key: "description", header: "Description", type: "string" },
        ]}
        queryKey={["work_order_misc_cost", workOrderId]}
        emptyMessage="No third-party services found"
        canAdd={!isReadOnly}
        addButtonText="Add Third-party Service"
        addFields={servicesFormTemplate}
        addEndpoint="/work-orders/work_order_misc_cost"
        addInitialData={{ work_order: workOrderId }}
        addLinkToModel="work_orders.workordermisccost"
        canEdit={true}
        editReadOnly={isReadOnly}
        editFields={servicesFormTemplate} // Fields will be processed dynamically
        editEndpoint={(itemId) => `/work-orders/work_order_misc_cost/${itemId}`}
        editInitialData={(row: Record<string, unknown>) => ({
          ...row,
          work_order: workOrderId,
        })}
        editFieldsTransform={(fields, row) =>
          fields.map((field) =>
            field.name === "files"
              ? { ...field, linkToId: row?.id as string }
              : field
          )
        }
      />
    </>
  );
};

export default WorkOrderServicesTab;
