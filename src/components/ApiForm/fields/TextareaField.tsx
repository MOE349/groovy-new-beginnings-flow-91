/**
 * TextareaField Component
 * Renders textarea with React Hook Form integration
 */

import React from "react";
import { Controller } from "react-hook-form";
import { UniversalFormField } from "@/components/forms";
import type { FieldProps, TextareaFieldConfig } from "../types";

export interface TextareaFieldProps<T> extends FieldProps<T> {
  field: TextareaFieldConfig;
}

export function TextareaField<T>({ field, form, name }: TextareaFieldProps<T>) {
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
            type="textarea"
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
            rows={field.rows || 3}
            inputValue={value ? String(value) : ""}
            onInputChange={onChange}
            className={error ? "border-destructive focus:ring-destructive" : ""}
          />
        )}
      />
      {field.maxLength && (
        <p className="text-xs text-muted-foreground text-right">
          <Controller
            name={name}
            control={control}
            render={({ field: { value } }) => (
              <span>
                {String(value || "").length} / {field.maxLength}
              </span>
            )}
          />
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error?.message as string}
        </p>
      )}
    </div>
  );
}

export default TextareaField;
