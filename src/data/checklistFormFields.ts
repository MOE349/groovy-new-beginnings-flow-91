import { FormField } from "@/components/ApiForm";

export const checklistItemFields: FormField[] = [
  {
    name: "name",
    type: "input",
    label: "Task Name",
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
    name: "category",
    type: "dropdown",
    label: "Category",
    required: false,
    endpoint: "/pm-automation/checklist-categories",
    queryKey: ["checklist_categories"],
    optionValueKey: "id",
    optionLabelKey: "name",
  },
  {
    name: "sequence_order",
    type: "input",
    label: "Sequence Order",
    required: false,
    inputType: "number",
  },
  {
    name: "is_required",
    type: "switch",
    label: "Required",
    required: false,
  },
  {
    name: "estimated_duration",
    type: "input",
    label: "Estimated Duration (minutes)",
    required: false,
    inputType: "number",
  },
];