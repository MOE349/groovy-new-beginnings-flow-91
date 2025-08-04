/**
 * TextareaField Component
 * Renders textarea with React Hook Form integration
 */

import React from "react";
import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
          <Textarea
            id={name}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={field.disabled}
            required={field.required}
            rows={field.rows || 3}
            maxLength={field.maxLength}
            className={cn(error && "border-destructive focus:ring-destructive")}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
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
                {(value || "").length} / {field.maxLength}
              </span>
            )}
          />
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default TextareaField;
