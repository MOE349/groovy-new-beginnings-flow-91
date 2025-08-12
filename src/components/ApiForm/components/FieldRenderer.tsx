/**
 * FieldRenderer Component
 * Dynamically renders the appropriate field component based on field type
 */

import React from "react";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import {
  InputField,
  TextareaField,
  SwitchField,
  DatePickerField,
  DropdownField,
  FileManagerField,
} from "../fields";
import type { FieldConfig } from "../types";

interface FieldRendererProps<T extends FieldValues = FieldValues> {
  field: FieldConfig;
  form: UseFormReturn<T>;
}

export function FieldRenderer<T extends FieldValues = FieldValues>({
  field,
  form,
}: FieldRendererProps<T>) {
  const name = field.name as Path<T>;

  switch (field.type) {
    case "input":
      return <InputField field={field} form={form} name={name} />;

    case "textarea":
      return <TextareaField field={field} form={form} name={name} />;

    case "switch":
      return <SwitchField field={field} form={form} name={name} />;

    case "datepicker":
      return <DatePickerField field={field} form={form} name={name} />;

    case "dropdown":
      return <DropdownField field={field} form={form} name={name} />;

    case "file_manager":
      return <FileManagerField field={field} form={form} name={name} />;

    default:
      console.warn(`Unknown field type: ${(field as any).type}`);
      return null;
  }
}

export default FieldRenderer;
