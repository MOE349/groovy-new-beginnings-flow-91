/**
 * DatePickerField Component
 * Renders date picker with React Hook Form integration
 */

import React from "react";
import { Controller } from "react-hook-form";
import { UniversalFormField } from "@/components/forms";
import type { FieldProps, DatePickerFieldConfig } from "../types";

export interface DatePickerFieldProps<T> extends FieldProps<T> {
  field: DatePickerFieldConfig;
}

export function DatePickerField<T>({
  field,
  form,
  name,
}: DatePickerFieldProps<T>) {
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
            name={name as string}
            type="datepicker"
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
            dateValue={value as Date}
            onDateChange={onChange}
            className={error ? "border-destructive" : ""}
          />
        )}
      />
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error?.message as string}
        </p>
      )}
    </div>
  );
}

export default DatePickerField;
