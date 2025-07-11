import { FormField } from "@/components/ApiForm";

export const workOrderFields: FormField[] = [
  {
    name: "code",
    type: "input",
    label: "Code",
    inputType: "text",
    required: false,
    disabled: true
  },
  {
    name: "location",
    type: "dropdown", 
    label: "Location",
    required: false,
    endpoint: "/company/location",
    optionValueKey: "id",
    optionLabelKey: "name"
  },
  {
    name: "asset",
    type: "dropdown",
    label: "Asset",
    required: true,
    endpoint: "/assets/equipments",
    optionValueKey: "id",
    optionLabelKey: "name"
  },
  {
    name: "status",
    type: "dropdown",
    label: "Status",
    required: true,
    endpoint: "/work-orders/status",
    optionValueKey: "id",
    optionLabelKey: "name"
  },
  {
    name: "maint_type",
    type: "input",
    label: "Maint Type",
    inputType: "text",
    required: false
  },
  {
    name: "priority",
    type: "input",
    label: "Priority",
    inputType: "text",
    required: false
  },
  {
    name: "starting_meter_reading",
    type: "input",
    label: "Starting Meter Reading",
    inputType: "number",
    required: false
  },
  {
    name: "completion_meter_reading",
    type: "input",
    label: "Completion Meter Reading",
    inputType: "number",
    required: false
  },
  {
    name: "suggested_start_date",
    type: "datepicker",
    label: "Suggested Start Date",
    required: false
  },
  {
    name: "completion_end_date",
    type: "datepicker",
    label: "Completion Date",
    required: false
  },
  {
    name: "description",
    type: "textarea",
    label: "Description",
    required: false,
    rows: 4
  }
];