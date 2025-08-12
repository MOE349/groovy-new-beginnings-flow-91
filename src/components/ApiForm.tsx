/**
 * ApiForm Compatibility Wrapper
 * This file ensures backward compatibility with the old import path
 * while redirecting to the new modular implementation
 */

export { default, ApiForm } from "./ApiForm/index";
export type { FormField } from "./ApiForm/index";
export type {
  ApiFormProps,
  FieldConfig,
  InputFieldConfig,
  TextareaFieldConfig,
  SwitchFieldConfig,
  DatePickerFieldConfig,
  DropdownFieldConfig,
  FileManagerFieldConfig,
  CustomLayoutProps,
} from "./ApiForm/index";
