/**
 * @deprecated Use UniversalFormField instead
 * Legacy compatibility wrapper for ApiTextArea
 */

import React from "react";
import { UniversalFormField } from "@/components/forms";

interface ApiTextAreaProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

const ApiTextAreaLegacy = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  className,
  required = false,
  disabled = false,
  rows = 3,
}: ApiTextAreaProps) => {
  console.warn(
    `[DEPRECATED] ApiTextArea is deprecated. Use UniversalFormField instead for field: ${name}`
  );

  return (
    <UniversalFormField
      name={name}
      type="textarea"
      label={label}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      rows={rows}
      inputValue={value}
      onInputChange={onChange}
      className={className}
    />
  );
};

export default ApiTextAreaLegacy;
