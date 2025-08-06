import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AutoSelectDropdown } from "@/components/forms";
import { toast } from "@/hooks/use-toast";
import { apiCall } from "@/utils/apis";
import { useQueryClient } from "@tanstack/react-query";

interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

interface FormField {
  name: string;
  type: "text" | "number" | "select" | "hidden" | "date";
  label: string;
  options?: { value: string; label: string }[];
  width?: string;
  suffix?: string;
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
  const initialFormData = formFields.reduce(
    (acc, field) => {
      acc[field.name] =
        field.type === "select" && field.options
          ? field.options[0]?.value || ""
          : "";
      return acc;
    },
    {} as Record<string, any>
  );

  initialFormData.is_active = true;
  initialFormData.trigger_type = "CALENDAR";

  const [formData, setFormData] = useState(initialFormData);

  const handleRowClick = (item: any, index: number) => {
    setSelectedRadioId(item?.id || index.toString());

    if (item) {
      console.log("PMTriggerContainer: Selected item:", item);
      console.log("PMTriggerContainer: Data key mapping:", dataKeyMapping);

      // Map data using provided mapping or use direct keys
      const mappedData = formFields.reduce(
        (acc, field) => {
          const dataKey = dataKeyMapping[field.name] || field.name;
          let value = item[dataKey];

          console.log(
            `PMTriggerContainer: Field ${field.name}, dataKey: ${dataKey}, value:`,
            value
          );

          // Handle different field types appropriately
          if (value === undefined || value === null) {
            value =
              field.type === "number" ? "" : field.options?.[0]?.value || "";
          } else if (field.type === "date" && value) {
            value = new Date(value).toISOString().split("T")[0];
          }

          acc[field.name] = value;
          return acc;
        },
        {} as Record<string, any>
      );

      console.log("PMTriggerContainer: Mapped data:", mappedData);

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
    if (fieldName === "next_iteration") {
      console.log("🎯 PMTriggerContainer: next_iteration changed to:", value);
    }
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
    console.log(
      `PMTriggerContainer: renderFormField ${field.name}, formData value:`,
      formData[field.name],
      "final value:",
      value
    );

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
            className={`h-6 px-2 text-xs border rounded ${field.width || "w-20"} ${!isFieldsEditable ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : "bg-background"}`}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "number":
        console.log(
          `PMTriggerContainer: Rendering number field ${field.name} with value:`,
          value,
          typeof value
        );
        return (
          <input
            type="number"
            value={value === "" ? "" : value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={!isFieldsEditable}
            className={`h-6 px-2 text-xs border rounded ${field.width || "w-16"} ${!isFieldsEditable ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : "bg-background"}`}
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={!isFieldsEditable}
            className={`h-6 px-2 text-xs border rounded ${field.width || "flex-1"} ${!isFieldsEditable ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : "bg-background"}`}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={!isFieldsEditable}
            className={`h-6 px-2 text-xs border rounded ${field.width || "flex-1"} ${!isFieldsEditable ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : "bg-background"}`}
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
                    className={`h-4 px-1 py-0.5 text-left align-middle font-medium text-primary-foreground bg-primary text-xs ${column.width || ""}`}
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
                        name={`${title.toLowerCase().replace(/\s+/g, "-")}-selection`}
                        value={item?.id || i}
                        checked={selectedRadioId === (item?.id || i.toString())}
                        onChange={() => {}}
                        className="w-2.5 h-2.5 pointer-events-none appearance-none border border-muted-foreground/30 bg-background rounded-sm checked:bg-primary checked:border-primary transition-all duration-200 relative checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:text-primary-foreground checked:after:text-[8px] checked:after:font-bold checked:after:flex checked:after:items-center checked:after:justify-center checked:after:leading-none"
                      />
                    </td>
                    {tableColumns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-1 py-0.5 text-left align-middle text-xs"
                      >
                        {column.key === "is_active"
                          ? item?.is_active
                            ? "Active"
                            : item?.is_active === false
                              ? "Inactive"
                              : "-"
                          : item?.[column.key] || "-"}
                      </td>
                    ))}
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
                    className="w-full [&>button]:h-7 [&>button]:text-xs [&>button]:px-2 [&>button]:py-0 [&>button]:min-h-0 [&>button]:border-input [&>button]:bg-background [&>button]:hover:bg-accent [&>button]:focus:bg-accent [&>button]:rounded-sm [&>button]:shadow-sm [&>button]:transition-colors [&>button]:duration-150"
                  />
                </div>
              ) : (
                <div className="w-full h-7 px-2 text-xs border border-input rounded-sm flex items-center text-muted-foreground bg-muted/50 shadow-sm">
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

            // Skip interval_unit as it's rendered with interval_value
            if (field.name === "interval_unit") {
              return null;
            }

            return (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">
                  {field.label}
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
            className={`w-full h-8 text-xs ${formData.is_active ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-500 hover:bg-gray-600 text-white"}`}
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
