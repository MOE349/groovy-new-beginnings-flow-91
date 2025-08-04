/**
 * InputField Component
 * Renders various input types with React Hook Form integration
 */

import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FieldProps, InputFieldConfig } from "../types";

export interface InputFieldProps<T> extends FieldProps<T> {
  field: InputFieldConfig;
}

export function InputField<T>({ field, form, name }: InputFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = form;

  const error = errors[name as keyof typeof errors];
  const isHidden = field.inputType === "hidden";

  if (isHidden) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <input
            type="hidden"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      />
    );
  }

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
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            id={name}
            type={field.inputType || "text"}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => {
              const val =
                field.inputType === "number"
                  ? e.target.valueAsNumber
                  : e.target.value;
              onChange(val);
            }}
            onBlur={onBlur}
            disabled={field.disabled}
            required={field.required}
            min={field.min}
            max={field.max}
            step={field.step}
            pattern={field.pattern}
            className={cn(
              error && "border-destructive focus:ring-destructive",
              field.inputType === "number" && "appearance-none"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
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

export default InputField;
