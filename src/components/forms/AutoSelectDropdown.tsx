/**
 * AutoSelectDropdown Component
 *
 * Extends UniversalFormField dropdown with auto-selection of first item.
 * Use this component when you want the dropdown to automatically select
 * the first available option when options are loaded.
 */

import React from "react";
import UniversalFormField, {
  UniversalFormFieldProps,
} from "./UniversalFormField";
import { useQuery } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";

export interface AutoSelectDropdownProps
  extends Omit<UniversalFormFieldProps, "type"> {
  // All props from UniversalFormField except 'type' (forced to be 'dropdown')
}

const AutoSelectDropdown: React.FC<AutoSelectDropdownProps> = (props) => {
  const {
    value,
    onChange,
    options = [],
    endpoint,
    queryKey,
    optionValueKey = "id",
    optionLabelKey = "name",
    ...restProps
  } = props;

  // Fetch data from API if endpoint is provided
  const { data: apiData } = useQuery({
    queryKey: queryKey || [endpoint],
    queryFn: () => apiCall(endpoint || ""),
    enabled: !!endpoint && options.length === 0,
  });

  // Generate dropdown options (enhanced for manual-generation endpoint)
  const dropdownOptions = React.useMemo(() => {
    if (options.length > 0) {
      return options;
    }

    // Handle different API response structures
    let dataArray: any[] = [];

    if (apiData?.data) {
      // Check for manual-generation response format: nested in apiData.data.data
      if (
        apiData.data.data &&
        typeof apiData.data.data === "object" &&
        !Array.isArray(apiData.data.data)
      ) {
        const objectKeys = Object.keys(apiData.data.data);
        if (
          objectKeys.length > 0 &&
          objectKeys.every((key) => !isNaN(Number(key)))
        ) {
          // Convert object to array format
          dataArray = Object.entries(apiData.data.data).map(([key, value]) => ({
            [optionValueKey]: key,
            [optionLabelKey]: value,
          }));
        }
      }
      // Check for manual-generation response format: { "0": "5000 km", "1": "10000 km", ... }
      else if (
        typeof apiData.data === "object" &&
        !Array.isArray(apiData.data) &&
        !apiData.data.data
      ) {
        const objectKeys = Object.keys(apiData.data);
        if (
          objectKeys.length > 0 &&
          objectKeys.every((key) => !isNaN(Number(key)))
        ) {
          // Convert object to array format
          dataArray = Object.entries(apiData.data).map(([key, value]) => ({
            [optionValueKey]: key,
            [optionLabelKey]: value,
          }));
        }
      }
      // First check for nested iterations in PM settings (apiData.data.data.iterations)
      else if (
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
    if (dropdownOptions.length > 0 && (!value || value === "") && onChange) {
      onChange(dropdownOptions[0].value);
    }
  }, [dropdownOptions, value, onChange]);

  // Render the standard UniversalFormField with type forced to 'dropdown'
  return (
    <UniversalFormField
      {...restProps}
      type="dropdown"
      value={value}
      onChange={onChange}
      options={dropdownOptions} // Pass the processed options
      // Don't pass endpoint when we have processed options to avoid conflicts
      endpoint={dropdownOptions.length > 0 ? undefined : endpoint}
      queryKey={dropdownOptions.length > 0 ? undefined : queryKey}
      optionValueKey={optionValueKey}
      optionLabelKey={optionLabelKey}
    />
  );
};

export default AutoSelectDropdown;
