import { FormField } from "@/components/ApiForm";

export const siteFormFields: FormField[] = [
  {
    name: "code",
    type: "input",
    label: "Code",
    inputType: "text",
    required: true,
  },
  {
    name: "name",
    type: "input",
    label: "Name",
    inputType: "text",
    required: true,
  },
];

export const locationFormFields: FormField[] = [
  {
    name: "site",
    type: "dropdown",
    label: "Site",
    required: true,
    endpoint: "/company/site",
    optionValueKey: "id",
    optionLabelKey: "name",
    queryKey: ["company-sites"],
  },
  {
    name: "name",
    type: "input",
    label: "Name",
    inputType: "text",
    required: true,
  },
  {
    name: "address",
    type: "input",
    label: "Address",
    inputType: "text",
    required: false,
  },
  {
    name: "slug",
    type: "input",
    label: "Slug",
    inputType: "text",
    required: true,
  },
];