/**
 * DatePickerField Component
 * Renders date picker with React Hook Form integration
 */

import React from "react";
import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ApiDatePicker from "@/components/ApiDatePicker";
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
    <div className={cn("space-y-2", field.className)}>
      {field.label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <ApiDatePicker
            name={name}
            placeholder={field.placeholder}
            value={value}
            onChange={(date) => onChange(date)}
            disabled={field.disabled}
            required={field.required}
            className={cn(error && "border-destructive")}
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

export default DatePickerField;
