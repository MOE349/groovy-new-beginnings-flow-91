import { FormField } from "@/components/ApiForm";

export const partFields: FormField[] = [
  {
    name: "part_number",
    type: "input",
    label: "Part Number",
    required: true,
    inputType: "text",
  },
  {
    name: "name",
    type: "input",
    label: "Name",
    required: true,
    inputType: "text",
  },
  {
    name: "description",
    type: "textarea",
    label: "Description",
    required: false,
    rows: 3,
  },
  {
    name: "last_price",
    type: "input",
    label: "Last Price",
    required: false,
    inputType: "number",
  },
  {
    name: "make",
    type: "input",
    label: "Make",
    required: false,
    inputType: "text",
  },
  {
    name: "category",
    type: "input",
    label: "Category",
    required: false,
    inputType: "text",
  },
  {
    name: "component",
    type: "input",
    label: "Component",
    required: false,
    inputType: "text",
  },
];
