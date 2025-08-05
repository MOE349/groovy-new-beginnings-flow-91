/**
 * @deprecated Use UniversalFormField instead
 * Legacy compatibility wrapper for ApiInput
 */

import React from "react";
import { UniversalFormField } from "@/components/forms";

interface ApiInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "password" | "number" | "hidden";
}

const ApiInputLegacy = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  className,
  required = false,
  disabled = false,
  type = "text",
}: ApiInputProps) => {
  console.warn(
    `[DEPRECATED] ApiInput is deprecated. Use UniversalFormField instead for field: ${name}`
  );

  return (
    <UniversalFormField
      name={name}
      type="input"
      label={label}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      inputType={type}
      inputValue={value}
      onInputChange={onChange}
      className={className}
    />
  );
};

export default ApiInputLegacy;
