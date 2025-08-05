/**
 * @deprecated Use UniversalFormField instead
 * Legacy compatibility wrapper for ApiSwitch
 */

import React from "react";
import { UniversalFormField } from "@/components/forms";

interface ApiSwitchProps {
  name: string;
  label?: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const ApiSwitchLegacy = ({
  name,
  label,
  description,
  checked = false,
  onChange,
  className,
  disabled = false,
}: ApiSwitchProps) => {
  console.warn(
    `[DEPRECATED] ApiSwitch is deprecated. Use UniversalFormField instead for field: ${name}`
  );

  return (
    <UniversalFormField
      name={name}
      type="switch"
      label={label}
      description={description}
      disabled={disabled}
      checked={checked}
      onSwitchChange={onChange}
      className={className}
    />
  );
};

export default ApiSwitchLegacy;
