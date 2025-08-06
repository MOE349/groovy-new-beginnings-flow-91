import { FormField } from "@/components/ApiForm";

export const equipmentCategoryFormFields: FormField[] = [
  {
    name: "name",
    type: "input",
    label: "Name",
    inputType: "text",
    required: true,
  },
  {
    name: "slug",
    type: "input",
    label: "Slug",
    inputType: "text",
    required: true,
  },
];

export const attachmentCategoryFormFields: FormField[] = [
  {
    name: "name",
    type: "input",
    label: "Name",
    inputType: "text",
    required: true,
  },
  {
    name: "slug",
    type: "input",
    label: "Slug",
    inputType: "text",
    required: true,
  },
];
