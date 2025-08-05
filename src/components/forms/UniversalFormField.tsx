import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// UI Components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import GearSpinner from "@/components/ui/gear-spinner";

// API utilities
import { apiCall } from "@/utils/apis";

/**
 * Universal Form Field Component
 * Replaces all legacy API components (ApiInput, ApiTextArea, ApiSwitch, ApiDatePicker, ApiDropDown)
 * with a single, unified, flexible component
 */

export interface DropdownOption {
  value: string;
  label: string;
}

export interface UniversalFormFieldProps {
  // Core properties
  name: string;
  type: "input" | "textarea" | "switch" | "datepicker" | "dropdown";
  label?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;

  // Input-specific
  inputType?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "hidden"
    | "tel"
    | "url";

  // Textarea-specific
  rows?: number;

  // Switch-specific
  checked?: boolean;
  onSwitchChange?: (checked: boolean) => void;

  // DatePicker-specific
  dateValue?: Date;
  onDateChange?: (date: Date | undefined) => void;

  // Dropdown-specific
  value?: string;
  onChange?: (value: string) => void;
  options?: DropdownOption[];
  endpoint?: string;
  queryKey?: string[];
  optionValueKey?: string;
  optionLabelKey?: string;

  // Generic input handling
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

export const UniversalFormField: React.FC<UniversalFormFieldProps> = ({
  name,
  type,
  label,
  placeholder,
  description,
  className,
  required = false,
  disabled = false,

  // Input-specific
  inputType = "text",

  // Textarea-specific
  rows = 3,

  // Switch-specific
  checked = false,
  onSwitchChange,

  // DatePicker-specific
  dateValue,
  onDateChange,

  // Dropdown-specific
  value,
  onChange,
  options = [],
  endpoint,
  queryKey,
  optionValueKey = "id",
  optionLabelKey = "name",

  // Generic input
  inputValue,
  onInputChange,
}) => {
  // Dropdown data fetching
  const {
    data: apiData,
    isLoading: isOptionsLoading,
    error: optionsError,
  } = useQuery({
    queryKey: queryKey || ["dropdown", endpoint],
    queryFn: async () => {
      if (!endpoint) return { data: { data: [] } };
      return await apiCall(endpoint);
    },
    enabled: type === "dropdown" && !!endpoint && options.length === 0,
  });

  // Process dropdown options
  const dropdownOptions = React.useMemo(() => {
    if (options.length > 0) {
      return options;
    }

    // Handle different API response structures
    let dataArray: any[] = [];

    if (apiData?.data) {
      // First check for nested iterations in PM settings (apiData.data.data.iterations)
      if (
        apiData.data.data &&
        apiData.data.data.iterations &&
        Array.isArray(apiData.data.data.iterations)
      ) {
        dataArray = apiData.data.data.iterations;
      }
      // Second check for direct iterations (apiData.data.iterations)
      else if (
        apiData.data.iterations &&
        Array.isArray(apiData.data.iterations)
      ) {
        dataArray = apiData.data.iterations;
      }
      // Then check for standard data array
      else if (apiData.data.data && Array.isArray(apiData.data.data)) {
        dataArray = apiData.data.data;
      }
      // Finally check if data itself is an array
      else if (Array.isArray(apiData.data)) {
        dataArray = apiData.data;
      }
    }

    if (dataArray.length > 0) {
      return dataArray.map((item: any) => ({
        value: String(item[optionValueKey]),
        label: String(item[optionLabelKey]),
      }));
    }

    return [];
  }, [options, apiData, optionValueKey, optionLabelKey]);

  // Auto-select first option when dropdown options load and no value is set
  React.useEffect(() => {
    if (
      type === "dropdown" &&
      dropdownOptions.length > 0 &&
      (!value || value === "") &&
      onChange
    ) {
      onChange(dropdownOptions[0].value);
    }
  }, [type, dropdownOptions, value, onChange]);

  // Render field based on type
  const renderField = () => {
    switch (type) {
      case "input":
        if (inputType === "hidden") {
          return (
            <Input
              type="hidden"
              id={name}
              name={name}
              value={inputValue || value || ""}
              onChange={(e) => {
                onInputChange?.(e.target.value);
                onChange?.(e.target.value);
              }}
            />
          );
        }

        return (
          <Input
            type={inputType}
            id={name}
            name={name}
            placeholder={placeholder}
            value={inputValue || value || ""}
            onChange={(e) => {
              onInputChange?.(e.target.value);
              onChange?.(e.target.value);
            }}
            required={required}
            disabled={disabled}
            className={cn("", className)}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={inputValue || value || ""}
            onChange={(e) => {
              onInputChange?.(e.target.value);
              onChange?.(e.target.value);
            }}
            required={required}
            disabled={disabled}
            rows={rows}
            className={cn("", className)}
          />
        );

      case "switch":
        return (
          <div className={cn("flex items-center space-x-2", className)}>
            <Switch
              id={name}
              name={name}
              checked={checked}
              onCheckedChange={onSwitchChange}
              disabled={disabled}
            />
            <div className="space-y-1">
              {label && (
                <Label htmlFor={name} className="text-sm font-medium">
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        );

      case "datepicker":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !dateValue && "text-muted-foreground",
                  className
                )}
                disabled={disabled}
              >
                {dateValue ? (
                  format(dateValue, "PPP")
                ) : (
                  <span>{placeholder || "Pick a date"}</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={onDateChange}
                disabled={disabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case "dropdown":
        if (isOptionsLoading) {
          return (
            <div className="flex items-center space-x-2">
              <GearSpinner size="sm" />
              <span className="text-sm text-muted-foreground">
                Loading options...
              </span>
            </div>
          );
        }

        if (optionsError) {
          return (
            <div className="text-sm text-red-500">Failed to load options</div>
          );
        }

        return (
          <Select
            value={value || ""}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn("", className)}>
              <SelectValue placeholder={placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {dropdownOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  // For switch, label is handled internally
  if (type === "switch") {
    return renderField();
  }

  // For hidden inputs, no wrapper needed
  if (type === "input" && inputType === "hidden") {
    return renderField();
  }

  // Standard field with label wrapper
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderField()}
      {description && !["switch"].includes(type) && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default UniversalFormField;
