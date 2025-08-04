/**
 * SwitchField Component
 * Renders switch/toggle with React Hook Form integration
 */

import React from "react";
import { Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FieldProps, SwitchFieldConfig } from "../types";

export interface SwitchFieldProps<T> extends FieldProps<T> {
  field: SwitchFieldConfig;
}

export function SwitchField<T>({ field, form, name }: SwitchFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = form;

  const error = errors[name as keyof typeof errors];

  return (
    <div className={cn("space-y-2", field.className)}>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange, onBlur } }) => (
          <div className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={value || false}
              onCheckedChange={onChange}
              onBlur={onBlur}
              disabled={field.disabled}
              aria-invalid={!!error}
              aria-describedby={
                error
                  ? `${name}-error`
                  : field.description
                    ? `${name}-description`
                    : undefined
              }
            />
            {field.label && (
              <Label
                htmlFor={name}
                className={cn(
                  "text-sm font-medium cursor-pointer",
                  field.disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
            )}
          </div>
        )}
      />
      {field.description && (
        <p
          id={`${name}-description`}
          className="text-sm text-muted-foreground ml-6"
        >
          {field.description}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive ml-6">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default SwitchField;
