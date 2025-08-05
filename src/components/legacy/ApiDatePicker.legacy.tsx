/**
 * @deprecated Use UniversalFormField instead
 * Legacy compatibility wrapper for ApiDatePicker
 */

import React from "react";
import { UniversalFormField } from "@/components/forms";

interface ApiDatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const ApiDatePickerLegacy = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  className,
  required = false,
  disabled = false,
}: ApiDatePickerProps) => {
  console.warn(
    `[DEPRECATED] ApiDatePicker is deprecated. Use UniversalFormField instead for field: ${name}`
  );

  return (
    <UniversalFormField
      name={name}
      type="datepicker"
      label={label}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      dateValue={value}
      onDateChange={onChange}
      className={className}
    />
  );
};

export default ApiDatePickerLegacy;
