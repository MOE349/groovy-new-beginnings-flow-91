/**
 * InputField Component
 * Renders various input types with React Hook Form integration
 */

import React from "react";
import { Controller } from "react-hook-form";
import { UniversalFormField } from "@/components/forms";
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
          <UniversalFormField
            name={name}
            type="input"
            inputType="hidden"
            inputValue={value || ""}
            onInputChange={onChange}
          />
        )}
      />
    );
  }

  return (
    <div className={field.className}>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <UniversalFormField
            name={name}
            type="input"
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
            inputType={field.inputType || "text"}
            inputValue={value || ""}
            onInputChange={(val) => {
              const processedVal =
                field.inputType === "number" ? Number(val) : val;
              onChange(processedVal);
            }}
            className={error ? "border-destructive focus:ring-destructive" : ""}
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
