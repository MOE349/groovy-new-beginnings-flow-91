
import { useQuery } from "@tanstack/react-query";
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
        return response.data.data || response.data;
      } catch (err) {
        console.error('ApiDropDown: API error:', err);
        throw err;
      }
    },
    enabled: !!endpoint,
  });

  // Use static options or API options
  const finalOptions = options || (apiOptions ? apiOptions.map((item: any) => ({
    value: item[optionValueKey],
    label: item[optionLabelKey],
  })) : []);

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
          "h-8 text-sm", // Force consistent height and text size
          value ? "bg-blue-50/70" : ""
        )}>
          <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
          {isLoading && <GearSpinner />}
        </SelectTrigger>
        <SelectContent>
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
