import { FormField } from "@/components/ApiForm";

export const workOrderFields: FormField[] = [
  {
    name: "code",
    type: "input",
    label: "Code",
    required: false,
    disabled: true,
    inputType: "text",
  },
  {
    name: "asset",
    type: "dropdown",
    label: "Asset",
    required: true,
    endpoint: "/assets/assets",
    queryKey: ["assets_assets"],
    optionValueKey: "id",
    optionLabelKey: "name",
  },
  {
    name: "status",
    type: "dropdown",
    label: "Status", 
    required: true,
    endpoint: "/work-orders/status",
    queryKey: ["work_orders_status"],
    optionValueKey: "id",
    optionLabelKey: "name",
  },
  {
    name: "maint_type",
    type: "input",
    label: "Maint Type",
    required: false,
    inputType: "text",
  },
  {
    name: "priority",
    type: "input",
    label: "Priority",
    required: false,
    inputType: "text",
  },
  {
    name: "suggested_start_date",
    type: "datepicker",
    label: "Suggested Start Date",
    required: false,
  },
  {
    name: "suggested_completion_date",
    type: "datepicker",
    label: "Suggested End Date",
    required: false,
  },
  {
    name: "completion_end_date",
    type: "datepicker",
    label: "Completion Date",
    required: false,
  },
  {
    name: "description",
    type: "textarea",
    label: "Description",
    required: false,
    rows: 3,
  },
  {
    name: "asset.location",
    type: "input",
    label: "Location",
    required: false,
    disabled: true,
    inputType: "text",
  },
  {
    name: "completion_meter_reading",
    type: "input",
    label: "Completion MR",
    required: false,
    disabled: true,
    inputType: "text",
  },
];