/**
 * ApiForm Types
 * Comprehensive type definitions for the form component
 */

import { z } from "zod";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";

// Base field configuration
export interface BaseFieldConfig {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// Input field specific config
export interface InputFieldConfig extends BaseFieldConfig {
  type: "input";
  inputType?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "hidden"
    | "tel"
    | "url";
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
}

// Textarea field specific config
export interface TextareaFieldConfig extends BaseFieldConfig {
  type: "textarea";
  rows?: number;
  maxLength?: number;
}

// Switch field specific config
export interface SwitchFieldConfig extends BaseFieldConfig {
  type: "switch";
  description?: string;
}

// Date picker field specific config
export interface DatePickerFieldConfig extends BaseFieldConfig {
  type: "datepicker";
  minDate?: Date;
  maxDate?: Date;
  format?: string;
}

// Dropdown field specific config
export interface DropdownFieldConfig extends BaseFieldConfig {
  type: "dropdown";
  options?: Array<{ value: string; label: string }>;
  endpoint?: string;
  optionValueKey?: string;
  optionLabelKey?: string;
  queryKey?: string[];
  multiple?: boolean;
  searchable?: boolean;
}

// File manager field specific config
export interface FileManagerFieldConfig extends BaseFieldConfig {
  type: "file_manager";
  linkToModel?: string;
  linkToId?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  accept?: string;
}

// Union type for all field configurations
export type FieldConfig =
  | InputFieldConfig
  | TextareaFieldConfig
  | SwitchFieldConfig
  | DatePickerFieldConfig
  | DropdownFieldConfig
  | FileManagerFieldConfig;

// Form configuration
export interface FormConfig<T extends FieldValues = FieldValues> {
  fields: FieldConfig[];
  schema?: z.ZodType<T>;
  defaultValues?: Partial<T>;
}

// ApiForm component props
export interface ApiFormProps<T extends FieldValues = FieldValues> {
  fields: FieldConfig[];
  schema?: z.ZodType<T>;
  defaultValues?: Partial<T>;
  initialData?: Record<string, any>; // Backward compatibility
  onSubmit: (
    data: T,
    dirtyFields?: Partial<Record<keyof T, boolean>>
  ) => void | Promise<void>;
  onChange?: (data: T) => void;
  title?: string;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
  formClassName?: string;
  layout?: "vertical" | "horizontal" | "inline";
  columns?: number;
  showDirtyOnly?: boolean;
  resetOnSuccess?: boolean; // Reset form dirty state after successful submission
  customRender?: (props: CustomRenderProps<T>) => React.ReactNode;
  customLayout?: (props: CustomLayoutProps<T>) => React.ReactNode; // Backward compatibility
}

// Custom render props
export interface CustomRenderProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  fields: FieldConfig[];
  renderField: (field: FieldConfig) => React.ReactNode;
  isSubmitting: boolean;
  error?: string;
}

// Custom layout props - backward compatibility
export interface CustomLayoutProps<T extends FieldValues = FieldValues> {
  fields: FieldConfig[];
  formData: T;
  handleFieldChange: (name: string, value: any) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  loading: boolean;
  error?: string;
  renderField: (field: FieldConfig) => React.ReactNode;
  initialData?: Record<string, any>;
  // Enhancements for richer custom layouts
  form: UseFormReturn<T>;
  isSubmitting: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  shouldShowDirtyOnly?: boolean;
  resetOnSuccess?: boolean;
  utils: FormUtils<T>; // Expose form utilities including resetDirtyFields
}

// Field component props
export interface FieldProps<T extends FieldValues = FieldValues> {
  field: FieldConfig;
  form: UseFormReturn<T>;
  name: Path<T>;
}

// Form state
export interface FormState {
  isSubmitting: boolean;
  isDirty: boolean;
  dirtyFields: string[];
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Form utilities
export interface FormUtils<T extends FieldValues = FieldValues> {
  reset: (values?: Partial<T>) => void;
  resetDirtyFields: (values?: Partial<T>) => void; // Reset form with new baseline values
  setFieldValue: (name: Path<T>, value: any) => void;
  setFieldError: (name: Path<T>, error: string) => void;
  clearErrors: () => void;
  validate: () => Promise<ValidationResult>;
  getValues: () => T;
  getDirtyFields: () => Partial<Record<keyof T, boolean>>;
}
