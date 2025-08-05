/**
 * @deprecated Use UniversalFormField instead
 * Legacy compatibility wrapper for ApiDropDown
 */

import React from "react";
import { UniversalFormField } from "@/components/forms";
import type { DropdownOption } from "@/components/forms";

interface ApiDropDownProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  // For static options
  options?: DropdownOption[];
  // For API-based options
  endpoint?: string;
  queryKey?: string[];
  optionValueKey?: string;
  optionLabelKey?: string;
}

const ApiDropDownLegacy = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  className,
  required = false,
  disabled = false,
  options = [],
  endpoint,
  queryKey,
  optionValueKey = "id",
  optionLabelKey = "name",
}: ApiDropDownProps) => {
  console.warn(
    `[DEPRECATED] ApiDropDown is deprecated. Use UniversalFormField instead for field: ${name}`
  );

  return (
    <UniversalFormField
      name={name}
      type="dropdown"
      label={label}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      value={value}
      onChange={onChange}
      options={options}
      endpoint={endpoint}
      queryKey={queryKey}
      optionValueKey={optionValueKey}
      optionLabelKey={optionLabelKey}
      className={className}
    />
  );
};

export default ApiDropDownLegacy;
