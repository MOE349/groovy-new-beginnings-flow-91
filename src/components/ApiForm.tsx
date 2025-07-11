import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ApiInput from "./ApiInput";
import ApiTextArea from "./ApiTextArea";
import ApiSwitch from "./ApiSwitch";
import ApiDatePicker from "./ApiDatePicker";
import ApiDropDown from "./ApiDropDown";
import { cn } from "@/lib/utils";

export interface FormField {
  name: string;
  type: "input" | "textarea" | "switch" | "datepicker" | "dropdown";
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  // Layout properties
  size?: "half" | "full" | "third" | "quarter";
  component?: string;
  // Input specific
  inputType?: "text" | "email" | "password" | "number";
  // TextArea specific
  rows?: number;
  // Switch specific
  description?: string;
  // Dropdown specific
  options?: Array<{ value: string; label: string }>;
  endpoint?: string;
  optionValueKey?: string;
  optionLabelKey?: string;
  queryKey?: string[];
}

interface ApiFormProps {
  fields: FormField[];
  title?: string;
  onSubmit?: (data: Record<string, any>) => void;
  submitText?: string;
  className?: string;
  loading?: boolean;
  error?: string;
  initialData?: Record<string, any>;
  customLayout?: (props: {
    fields: FormField[];
    formData: Record<string, any>;
    handleFieldChange: (name: string, value: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    error?: string;
    renderField: (field: FormField) => React.ReactNode;
  }) => React.ReactNode;
}

const ApiForm = ({
  fields,
  title,
  onSubmit,
  submitText = "Submit",
  className,
  loading = false,
  error,
  initialData = {},
  customLayout,
}: ApiFormProps) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  // Update form data when initialData changes (for edit forms with async data)
  useEffect(() => {
    // Only update if initialData has actual content
    if (Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert Date objects to YYYY-MM-DD format for API submission
    const processedData = { ...formData };
    Object.keys(processedData).forEach(key => {
      if (processedData[key] instanceof Date) {
        processedData[key] = processedData[key].toISOString().split('T')[0];
      }
    });
    
    onSubmit?.(processedData);
  };

  const renderField = (field: FormField) => {
    const getSizeClass = (size?: string) => {
      switch (size) {
        case "half": return "w-1/2";
        case "third": return "w-1/3";
        case "quarter": return "w-1/4";
        case "full":
        default: return "w-full";
      }
    };

    const commonProps = {
      name: field.name,
      label: field.label,
      required: field.required,
      disabled: field.disabled || loading,
      className: `mb-4 ${getSizeClass(field.size)}`,
    };

    switch (field.type) {
      case "input":
        return (
          <ApiInput
            key={field.name}
            {...commonProps}
            type={field.inputType}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(value) => handleFieldChange(field.name, value)}
          />
        );

      case "textarea":
        return (
          <ApiTextArea
            key={field.name}
            {...commonProps}
            placeholder={field.placeholder}
            rows={field.rows}
            value={formData[field.name] || ""}
            onChange={(value) => handleFieldChange(field.name, value)}
          />
        );

      case "switch":
        return (
          <ApiSwitch
            key={field.name}
            {...commonProps}
            description={field.description}
            checked={formData[field.name] || false}
            onChange={(checked) => handleFieldChange(field.name, checked)}
          />
        );

      case "datepicker":
        return (
          <ApiDatePicker
            key={field.name}
            {...commonProps}
            placeholder={field.placeholder}
            value={formData[field.name]}
            onChange={(date) => handleFieldChange(field.name, date)}
          />
        );

      case "dropdown":
        return (
          <ApiDropDown
            key={field.name}
            {...commonProps}
            placeholder={field.placeholder}
            options={field.options}
            endpoint={field.endpoint}
            optionValueKey={field.optionValueKey}
            optionLabelKey={field.optionLabelKey}
            queryKey={field.queryKey}
            value={formData[field.name] || ""}
            onChange={(value) => handleFieldChange(field.name, value)}
          />
        );

      default:
        return null;
    }
  };

  // If custom layout is provided, use it
  if (customLayout) {
    return (
      <div className={className}>
        {customLayout({
          fields,
          formData,
          handleFieldChange,
          handleSubmit,
          loading,
          error,
          renderField,
        })}
      </div>
    );
  }

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Loading..." : "Save"}
      </Button>
      
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(renderField)}
        </div>
      </div>
    </form>
  );

  if (title) {
    return (
      <Card className={cn("h-full flex flex-col", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">{content}</CardContent>
      </Card>
    );
  }

  return <div className={cn("space-y-4 h-full", className)}>{content}</div>;
};

export default ApiForm;