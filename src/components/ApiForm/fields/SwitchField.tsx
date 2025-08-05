/**
 * SwitchField Component
 * Renders switch/toggle with React Hook Form integration
 */

import React from "react";
import { Controller } from "react-hook-form";
import { UniversalFormField } from "@/components/forms";
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
    <div className={field.className}>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <UniversalFormField
            name={name as string}
            type="switch"
            label={field.label}
            description={field.description}
            required={field.required}
            disabled={field.disabled}
            checked={Boolean(value)}
            onSwitchChange={onChange}
          />
        )}
      />
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive ml-6">
          {error?.message as string}
        </p>
      )}
    </div>
  );
}

export default SwitchField;
