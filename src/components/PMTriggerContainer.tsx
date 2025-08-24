import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AutoSelectDropdown, UniversalFormField } from "@/components/forms";
import { toast } from "@/hooks/use-toast";
import { apiCall } from "@/utils/apis";
import { useQueryClient } from "@tanstack/react-query";
import {
  formatDateOptimized,
  formatDateTimeOptimized,
} from "@/utils/dateFormatters";

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  type?: string;
}

interface FormField {
  name: string;
  type:
    | "text"
    | "number"
    | "select"
    | "hidden"
    | "date"
    | "datepicker"
    | "dropdown"
    | "checkbox";
  label: string;
  options?: { value: string; label: string }[];
  width?: string;
  suffix?: string;
  required?: boolean;
  endpoint?: string;
  queryKey?: string[];
  optionValueKey?: string;
  optionLabelKey?: string;
}

interface PMTriggerContainerProps {
  title: string;
  endpoint: string;
  data: any[];
  tableColumns: TableColumn[];
  formFields: FormField[];
  assetId: string;
  dataKeyMapping?: Record<string, string>;
  generateWorkOrderEndpoint?: string;
  nextIterationEndpoint?: string;
}

export const PMTriggerContainer: React.FC<PMTriggerContainerProps> = ({
  title,
  endpoint,
  data,
  tableColumns,
  formFields,
  assetId,
  dataKeyMapping = {},
  generateWorkOrderEndpoint,
  nextIterationEndpoint,
}) => {
  const queryClient = useQueryClient();
  const [selectedRadioId, setSelectedRadioId] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFieldsEditable, setIsFieldsEditable] = useState(false);

  // Initialize form data based on form fields
  const initialFormData = formFields.reduce((acc, field) => {
    acc[field.name] =
      field.type === "select" && field.options
        ? field.options[0]?.value || ""
        : field.type === "checkbox"
        ? false
        : "";
    return acc;
  }, {} as Record<string, any>);

  initialFormData.is_active = true;
  initialFormData.trigger_type = "CALENDAR";

  const [formData, setFormData] = useState(initialFormData);

  const handleRowClick = (item: any, index: number) => {
    setSelectedRadioId(item?.id || index.toString());

    if (item) {
      // Map data using provided mapping or use direct keys
      const mappedData = formFields.reduce((acc, field) => {
        const dataKey = dataKeyMapping[field.name] || field.name;
        let value = item[dataKey];

        // Handle different field types appropriately
        if (value === undefined || value === null) {
          value =
            field.type === "number"
              ? ""
              : field.type === "checkbox"
              ? false
              : field.options?.[0]?.value || "";
        } else if (field.type === "date" && value) {
          value = new Date(value).toISOString().split("T")[0];
        } else if (field.type === "dropdown" && value) {
          // Handle dropdown values - extract ID if it's an object
          value = value?.id || value || "";
        } else if (field.type === "checkbox") {
          // Ensure checkbox values are boolean
          value = !!value;
        }

        acc[field.name] = value;
        return acc;
      }, {} as Record<string, any>);

      mappedData.is_active =
        item.is_active !== undefined ? item.is_active : true;
      // Clear next_iteration when selecting a new PM setting so auto-selection can work
      mappedData.next_iteration = "";
      setFormData(mappedData);
      setIsEditMode(true);
      setSelectedItemId(item.id);
      setIsFieldsEditable(false);
    } else {
      setFormData({ ...initialFormData, is_active: true });
      setIsEditMode(false);
      setSelectedItemId(null);
      setIsFieldsEditable(true);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!isFieldsEditable) {
      setIsFieldsEditable(true);
      return;
    }

    const submissionData = {
      ...formData,
      asset: assetId,
    };

    try {
      if (isEditMode && selectedItemId) {
        await apiCall(`${endpoint}/${selectedItemId}`, {
          method: "PUT",
          body: submissionData,
        });
        toast({
          title: "Success",
          description: `${title} updated successfully!`,
        });
      } else {
        await apiCall(endpoint, {
          method: "POST",
          body: submissionData,
        });
        toast({
          title: "Success",
          description: `${title} created successfully!`,
        });
      }

      setIsEditMode(false);
      setSelectedItemId(null);
      setIsFieldsEditable(false);
      queryClient.invalidateQueries({
        queryKey: [`${endpoint}?asset=${assetId}`],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message ||
          `Failed to ${isEditMode ? "update" : "create"} ${title}`,
        variant: "destructive",
      });
    }
  };

  const handleGenerateWorkOrder = async () => {
    if (!selectedItemId || !generateWorkOrderEndpoint) return;

    try {
      await apiCall(`${generateWorkOrderEndpoint}/${selectedItemId}`, {
        method: "POST",
      });
      toast({
        title: "Success",
        description: "Work order generated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate work order",
        variant: "destructive",
      });
    }
  };

  const renderFormField = (field: FormField) => {
    const value =
      formData[field.name] !== undefined ? formData[field.name] : "";

    switch (field.type) {
      case "hidden":
        return (
          <input
            type="hidden"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={!isFieldsEditable}
            className={`h-6 px-1 text-xs border rounded ${
              field.width || "w-20"
            } ${
              !isFieldsEditable
                ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                : "bg-background"
            }`}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            value={value === "" ? "" : value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={!isFieldsEditable}
            required={field.required}
            className={`h-6 px-1 text-xs border rounded ${
              field.width || "w-16"
            } ${
              !isFieldsEditable
                ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                : "bg-background"
            } ${field.required && !value ? "border-red-300" : ""}`}
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={!isFieldsEditable}
            required={field.required}
            className={`h-6 px-1 text-xs border rounded ${
              field.width || "flex-1"
            } ${
              !isFieldsEditable
                ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                : "bg-background"
            } ${field.required && !value ? "border-red-300" : ""}`}
          />
        );
      case "datepicker":
        return (
          <div className={field.width || "flex-1"}>
            <UniversalFormField
              name={field.name}
              type="datepicker"
              dateValue={value ? new Date(value) : undefined}
              onDateChange={(date) => {
                const dateString = date ? date.toISOString().split("T")[0] : "";
                handleFieldChange(field.name, dateString);
              }}
              disabled={!isFieldsEditable}
              required={field.required}
              className="[&>button]:h-6 [&>button]:text-xs [&>button]:px-1 [&>button]:py-0 [&>button]:min-h-0 [&>button]:max-h-6 [&>button]:border-input [&>button]:bg-background [&>button]:hover:bg-accent [&>button]:focus:bg-accent [&>button]:rounded [&>button]:shadow-sm [&>button]:transition-colors [&>button]:duration-150 [&>button]:!leading-3 [&>button]:box-border [&>button>span]:leading-none [&>button>span]:text-xs"
            />
          </div>
        );
      case "dropdown":
        return (
          <div className={field.width || "flex-1"}>
            <AutoSelectDropdown
              name={field.name}
              value={value}
              onChange={(newValue) => handleFieldChange(field.name, newValue)}
              endpoint={field.endpoint}
              queryKey={field.queryKey}
              optionValueKey={field.optionValueKey || "id"}
              optionLabelKey={field.optionLabelKey || "name"}
              placeholder={`Select ${field.label.toLowerCase()}`}
              disabled={!isFieldsEditable}
              className="w-full [&>button]:h-6 [&>button]:text-xs [&>button]:px-1 [&>button]:py-0 [&>button]:min-h-0 [&>button]:max-h-6 [&>button]:border-input [&>button]:bg-background [&>button]:hover:bg-accent [&>button]:focus:bg-accent [&>button]:rounded [&>button]:shadow-sm [&>button]:transition-colors [&>button]:duration-150 [&>button]:!leading-3 [&>button]:box-border [&>button>span]:leading-none [&>button>span]:text-xs"
            />
          </div>
        );
      case "checkbox":
        return (
          <div className={`flex items-center gap-2 ${field.width || "flex-1"}`}>
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              disabled={!isFieldsEditable}
              className="w-4 h-4 rounded border border-input bg-background checked:bg-primary checked:border-primary"
            />
            <span className="text-xs text-muted-foreground">{field.label}</span>
          </div>
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={!isFieldsEditable}
            required={field.required}
            className={`h-6 px-1 text-xs border rounded ${
              field.width || "flex-1"
            } ${
              !isFieldsEditable
                ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                : "bg-background"
            } ${field.required && !value ? "border-red-300" : ""}`}
          />
        );
    }
  };

  return (
    <div className="px-2 pt-2 pb-0 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
      <div className="flex items-center justify-center gap-4 mb-2 py-1 bg-accent/20 border border-accent/30 rounded-md">
        <h5 className="text-xs font-medium text-primary dark:text-secondary">
          {title}
        </h5>
      </div>

      <div className="mb-4">
        <div className="w-full">
          <table className="w-full caption-bottom text-xs">
            <thead>
              <tr className="border-b">
                <th className="h-4 px-1 py-0.5 text-left align-middle font-medium text-primary-foreground bg-primary text-xs w-6"></th>
                {tableColumns.map((column, index) => (
                  <th
                    key={index}
                    className={`h-4 px-1 py-0.5 text-left align-middle font-medium text-primary-foreground bg-primary text-xs ${
                      column.width || ""
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }, (_, i) => {
                const item = data?.[i];
                return (
                  <tr
                    key={i}
                    className="border-b cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(item, i)}
                  >
                    <td className="px-1 py-0.5 text-left align-middle text-xs">
                      <input
                        type="radio"
                        name={`${title
                          .toLowerCase()
                          .replace(/\s+/g, "-")}-selection`}
                        value={item?.id || i}
                        checked={selectedRadioId === (item?.id || i.toString())}
                        onChange={() => {}}
                        className="w-2.5 h-2.5 pointer-events-none appearance-none border border-muted-foreground/30 bg-background rounded-sm checked:bg-primary checked:border-primary transition-all duration-200 relative checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:text-primary-foreground checked:after:text-[8px] checked:after:font-bold checked:after:flex checked:after:items-center checked:after:justify-center checked:after:leading-none"
                      />
                    </td>
                    {tableColumns.map((column, colIndex) => {
                      const value = item?.[column.key];
                      let displayValue = value || "-";

                      // Format based on column type or key
                      if (column.key === "is_active") {
                        displayValue = item?.is_active
                          ? "Active"
                          : item?.is_active === false
                          ? "Inactive"
                          : "-";
                      } else if (column.type === "date") {
                        displayValue = formatDateOptimized(value);
                      } else if (
                        column.type === "datetime" ||
                        column.type === "timestamp"
                      ) {
                        displayValue = formatDateTimeOptimized(value);
                      } else if (column.key.includes("date") && value) {
                        // Auto-detect date fields by key name
                        displayValue = formatDateTimeOptimized(value);
                      }

                      return (
                        <td
                          key={colIndex}
                          className="px-1 py-0.5 text-left align-middle text-xs"
                        >
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-2 pb-2 flex flex-col gap-2 mt-7">
          {generateWorkOrderEndpoint && (
            <Button
              variant="secondary"
              size="sm"
              className="text-secondary py-1 px-3 text-sm w-full"
              disabled={!selectedItemId}
              onClick={handleGenerateWorkOrder}
            >
              Generate WO Now
            </Button>
          )}

          {nextIterationEndpoint && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground text-center">
                Next Iteration
              </span>
              {selectedItemId ? (
                <div className="next-iteration-dropdown">
                  <AutoSelectDropdown
                    name="next_iteration"
                    value={formData.next_iteration || ""}
                    onChange={(value) =>
                      handleFieldChange("next_iteration", value)
                    }
                    endpoint={`${nextIterationEndpoint}/${selectedItemId}`}
                    queryKey={[`${nextIterationEndpoint}/${selectedItemId}`]}
                    optionValueKey="id"
                    optionLabelKey="name"
                    placeholder="Select iteration"
                    disabled={!isFieldsEditable}
                    className="w-full [&>button]:h-6 [&>button]:text-xs [&>button]:px-1 [&>button]:py-0 [&>button]:min-h-0 [&>button]:max-h-6 [&>button]:border-input [&>button]:bg-background [&>button]:hover:bg-accent [&>button]:focus:bg-accent [&>button]:rounded-sm [&>button]:shadow-sm [&>button]:transition-colors [&>button]:duration-150 [&>button]:!leading-3 [&>button]:box-border [&>button>span]:leading-none [&>button>span]:text-xs"
                  />
                </div>
              ) : (
                <div className="w-full h-6 px-1 text-xs border border-input rounded-sm flex items-center text-muted-foreground bg-muted/50 shadow-sm">
                  No PM setting selected
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow overflow-auto flex flex-col justify-end pb-4">
        <div className="space-y-0.5 border-2 border-dashed border-muted-foreground/30 rounded-md p-2 mb-2">
          {formFields.map((field, index) => {
            if (field.type === "hidden") {
              return (
                <div key={`hidden-${field.name}-${index}`}>
                  {renderFormField(field)}
                </div>
              );
            }

            // Group interval fields together like in meter reading trigger
            if (field.name === "interval_value") {
              const nextField = formFields[index + 1];
              if (nextField?.name === "interval_unit") {
                return (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                    {renderFormField(field)}
                    {renderFormField(nextField)}
                    {field.suffix && (
                      <span className="text-xs text-muted-foreground">
                        {field.suffix}
                      </span>
                    )}
                  </div>
                );
              }
            }

            // Group start_date and maint_type together
            if (field.name === "start_date") {
              const nextField = formFields[index + 1];
              if (nextField?.name === "maint_type") {
                return (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                    {renderFormField(field)}
                    <span className="text-xs text-muted-foreground">
                      {nextField.label}
                    </span>
                    {renderFormField(nextField)}
                  </div>
                );
              }
            }

            // Skip interval_unit as it's rendered with interval_value
            if (field.name === "interval_unit") {
              return null;
            }

            // Skip maint_type as it's rendered with start_date
            if (field.name === "maint_type") {
              return null;
            }

            // Special handling for checkbox fields - no external label needed
            if (field.type === "checkbox") {
              return (
                <div key={index} className="flex items-center gap-2">
                  {renderFormField(field)}
                </div>
              );
            }

            return (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </span>
                {renderFormField(field)}
                {field.suffix && (
                  <span className="text-xs text-muted-foreground">
                    {field.suffix}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <Button
            className={`w-full h-8 text-xs ${
              formData.is_active
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
            onClick={() =>
              isFieldsEditable &&
              handleFieldChange("is_active", !formData.is_active)
            }
            disabled={!isFieldsEditable}
          >
            {formData.is_active ? "✓ Active" : "✗ Inactive"}
          </Button>
        </div>

        <div className="mt-0.5">
          <Button
            className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-white"
            onClick={handleSubmit}
          >
            {!isFieldsEditable ? "Edit" : isEditMode ? "Save" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};
