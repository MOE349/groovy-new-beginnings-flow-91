import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiCall } from "@/utils/apis";
import { cn } from "@/lib/utils";
import GearSpinner from "@/components/ui/gear-spinner";

interface DropdownOption {
  value: string;
  label: string;
}

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
  // For API-driven options
  endpoint?: string;
  optionValueKey?: string;
  optionLabelKey?: string;
  queryKey?: string[];
}

const ApiDropDown = ({
  name,
  label,
  placeholder = "Select an option",
  value,
  onChange,
  className,
  required = false,
  disabled = false,
  options,
  endpoint,
  optionValueKey = "value",
  optionLabelKey = "label",
  queryKey,
}: ApiDropDownProps) => {
  // Fetch options from API if endpoint is provided
  const {
    data: apiOptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKey || [endpoint || "dropdown"],
    queryFn: async () => {
      if (!endpoint) return [];
      console.log('ApiDropDown: Fetching from endpoint:', endpoint);
      try {
        const response = await apiCall(endpoint);
        console.log('ApiDropDown: API response:', response);
        let data = response.data?.data || response.data || [];
        
        // Handle different response formats
        if (!Array.isArray(data)) {
          console.warn('ApiDropDown: API response is not an array, converting to array:', data);
          
          // Check if it's a key-value object (like PM iterations)
          if (typeof data === 'object' && data !== null) {
            // Convert object to array format: {key: value} -> [{id: key, name: value}]
            data = Object.entries(data).map(([key, value]) => ({
              id: key,
              name: `${value}` // Convert to string for display
            }));
          } else {
            data = data ? [data] : [];
          }
        }
        
        return data;
      } catch (err) {
        console.error('ApiDropDown: API error:', err);
        return []; // Return empty array on error
      }
    },
    enabled: !!endpoint,
  });

  // Use static options or API options, ensuring apiOptions is always an array
  const finalOptions = options || (Array.isArray(apiOptions) ? apiOptions.map((item: any) => ({
    value: item[optionValueKey],
    label: item[optionLabelKey],
  })) : []);

  // Auto-select the lowest key by default (only for PM iteration dropdowns)
  useEffect(() => {
    if (!value && finalOptions.length > 0 && endpoint?.includes('manual-generation')) {
      // Sort options by numeric value and select the lowest
      const sortedOptions = [...finalOptions].sort((a, b) => {
        const numA = parseInt(a.value) || 0;
        const numB = parseInt(b.value) || 0;
        return numA - numB;
      });
      
      if (sortedOptions.length > 0 && onChange) {
        onChange(sortedOptions[0].value);
      }
    }
  }, [finalOptions, value, onChange, endpoint]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className={required ? "after:content-['*'] after:text-destructive" : ""}>
          {label}
        </Label>
      )}
      <Select
        name={name}
        value={value}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className={cn(
          value ? "bg-blue-50/70" : ""
        )}>
          <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
          {isLoading && <GearSpinner />}
        </SelectTrigger>
        <SelectContent className="bg-background border border-border shadow-md z-50">
          {error ? (
            <SelectItem value="__error__" disabled>
              Error loading options
            </SelectItem>
          ) : finalOptions.length === 0 ? (
            <SelectItem value="__empty__" disabled>
              No options available
            </SelectItem>
          ) : (
            finalOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ApiDropDown;
