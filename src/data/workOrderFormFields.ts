import { FormField } from "@/components/ApiForm";

export const workOrderFields: FormField[] = [
  {
    name: "code",
    type: "input",
    label: "Code",
    inputType: "text",
    required: false,
    disabled: true,
    size: "full",
    component: "readonly_field"
  },
  {
    name: "location",
    type: "dropdown", 
    label: "Location",
    required: false,
    endpoint: "/company/location",
    optionValueKey: "id",
    optionLabelKey: "name",
    size: "full",
    component: "location_field"
  },
  {
    name: "asset",
    type: "dropdown",
    label: "Asset",
    required: true,
    endpoint: "/assets/equipments",
    optionValueKey: "id",
    optionLabelKey: "name",
    size: "full",
    component: "asset_field"
  },
  {
    name: "status",
    type: "dropdown",
    label: "Status",
    required: true,
    endpoint: "/work-orders/status",
    optionValueKey: "id",
    optionLabelKey: "name",
    size: "full",
    component: "status_field"
  },
  {
    name: "maint_type",
    type: "input",
    label: "Maint Type",
    inputType: "text",
    required: false,
    size: "half",
    component: "maint_type_field"
  },
  {
    name: "priority",
    type: "input",
    label: "Priority",
    inputType: "text",
    required: false,
    size: "half",
    component: "priority_field"
  },
  {
    name: "starting_meter_reading",
    type: "input",
    label: "Starting Meter Reading",
    inputType: "number",
    required: false,
    size: "half",
    component: "meter_reading_field"
  },
  {
    name: "completion_meter_reading",
    type: "input",
    label: "Completion Meter Reading",
    inputType: "number",
    required: false,
    size: "half",
    component: "meter_reading_field"
  },
  {
    name: "suggested_start_date",
    type: "datepicker",
    label: "Suggested Start Date",
    required: false,
    size: "half",
    component: "date_field"
  },
  {
    name: "completion_end_date",
    type: "datepicker",
    label: "Completion Date",
    required: false,
    size: "half",
    component: "date_field"
  },
  {
    name: "description",
    type: "textarea",
    label: "Description",
    required: false,
    rows: 4,
    size: "full",
    component: "description_field"
  },
  {
    name: "is_online",
    type: "switch",
    label: "Online Status",
    required: false,
    size: "half",
    component: "status_toggle"
  }
];