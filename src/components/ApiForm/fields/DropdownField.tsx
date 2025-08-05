/**
 * DropdownField Component
 * Renders dropdown with React Hook Form integration
 */

import React from "react";
import { Controller } from "react-hook-form";
import { UniversalFormField } from "@/components/forms";
import type { FieldProps, DropdownFieldConfig } from "../types";

export interface DropdownFieldProps<T> extends FieldProps<T> {
  field: DropdownFieldConfig;
}

export function DropdownField<T>({ field, form, name }: DropdownFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = form;

  const error = errors[name as keyof typeof errors];

  return (
    <div className={field.className}>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <UniversalFormField
            name={name}
            type="dropdown"
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
            value={value || ""}
            onChange={onChange}
            options={field.options}
            endpoint={field.endpoint}
            optionValueKey={field.optionValueKey}
            optionLabelKey={field.optionLabelKey}
            queryKey={field.queryKey}
            className={error ? "border-destructive" : ""}
          />
        )}
      />
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default DropdownField;
