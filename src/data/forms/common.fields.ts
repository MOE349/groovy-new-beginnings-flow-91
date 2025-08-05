import { FormField } from "@/components/ApiForm";

/**
 * Common Form Field Definitions
 * Reusable field configurations to reduce duplication across forms
 */

/**
 * Standard name field - used across multiple forms
 */
export const nameField: FormField = {
  name: "name",
  type: "input",
  label: "Name",
  required: false,
  inputType: "text",
};

/**
 * Standard code field - used for identifiers
 */
export const codeField: FormField = {
  name: "code",
  type: "input",
  label: "Code",
  required: false,
  inputType: "text",
};

/**
 * Standard description field - used for detailed descriptions
 */
export const descriptionField: FormField = {
  name: "description",
  type: "textarea",
  label: "Description",
  required: false,
  rows: 3,
};

/**
 * Factory functions for common dropdown fields
 */
export const createDropdownField = (
  name: string,
  label: string,
  endpoint: string,
  queryKey: string[],
  required = false
): FormField => ({
  name,
  type: "dropdown",
  label,
  required,
  endpoint,
  queryKey,
  optionValueKey: "id",
  optionLabelKey: "name",
});

/**
 * Factory function for simple text input fields
 */
export const createTextField = (
  name: string,
  label: string,
  required = false,
  inputType: "text" | "email" | "tel" | "url" = "text"
): FormField => ({
  name,
  type: "input",
  label,
  required,
  inputType,
});

/**
 * Factory function for number input fields
 */
export const createNumberField = (
  name: string,
  label: string,
  required = false
): FormField => ({
  name,
  type: "input",
  label,
  required,
  inputType: "number",
});

/**
 * Factory function for date picker fields
 */
export const createDateField = (
  name: string,
  label: string,
  required = false
): FormField => ({
  name,
  type: "datepicker",
  label,
  required,
});

/**
 * Factory function for switch/toggle fields
 */
export const createSwitchField = (
  name: string,
  label: string,
  description?: string,
  required = false
): FormField => ({
  name,
  type: "switch",
  label,
  description,
  required,
});
