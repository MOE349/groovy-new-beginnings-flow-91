/**
 * ApiForm Component
 * Modular, performant form with React Hook Form and Zod validation
 */

import React, { useCallback, useEffect } from "react";
import { FieldValues } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useForm } from "./hooks/useForm";
import { FieldRenderer } from "./components/FieldRenderer";
import { transformFormData } from "./utils/validation";
import type { ApiFormProps, FieldConfig } from "./types";

function ApiFormComponent<T extends FieldValues = FieldValues>({
  fields,
  schema,
  defaultValues,
  initialData, // Backward compatibility
  onSubmit,
  onChange,
  title,
  submitText = "Submit",
  cancelText = "Cancel",
  onCancel,
  loading = false,
  error,
  className,
  formClassName,
  layout = "vertical",
  columns = 1,
  showDirtyOnly,
  customRender,
  customLayout, // Backward compatibility
}: ApiFormProps<T>) {
  // Use initialData if provided for backward compatibility
  const formDefaultValues = defaultValues || initialData;

  // Auto-detect if this is an edit operation (has ID) and enable dirty fields by default
  const isEditOperation =
    formDefaultValues &&
    typeof formDefaultValues === "object" &&
    "id" in formDefaultValues &&
    formDefaultValues.id;

  const shouldShowDirtyOnly =
    showDirtyOnly !== undefined ? showDirtyOnly : isEditOperation;

  const { form, utils, isSubmitting, isDirty } = useForm<T>({
    fields,
    schema,
    defaultValues: formDefaultValues as Partial<T>,
    onChange,
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      form.reset(initialData as Partial<T>);
    }
  }, [initialData, form]);

  const handleSubmit = useCallback(
    async (data: T) => {
      try {
        // Filter out system fields that shouldn't be in create/update requests
        const filteredData = Object.keys(data).reduce((acc, key) => {
          // Skip system-generated fields
          if (
            [
              "id",
              "created_at",
              "updated_at",
              "created_by",
              "updated_by",
            ].includes(key)
          ) {
            return acc;
          }
          // Include field if it's defined in fields array OR if it's from custom layout fields
          const fieldExists = fields.some((field) => field.name === key);
          // Common fields from custom layouts that might not be in the main fields array
          const customLayoutFields = [
            "is_online",
            "location",
            "code",
            "name",
            "description",
            "category",
            "make",
            "model",
            "serial_number",
            "project",
            "equipment",
          ];

          if (fieldExists || customLayoutFields.includes(key)) {
            acc[key] = data[key];
          }
          return acc;
        }, {} as T);

        const transformedData = transformFormData(filteredData, fields);
        const dirtyFieldsMap = shouldShowDirtyOnly
          ? utils.getDirtyFields()
          : undefined;

        // If shouldShowDirtyOnly is true, only send the dirty (changed) fields
        let dataToSubmit = transformedData;
        if (shouldShowDirtyOnly && dirtyFieldsMap) {
          dataToSubmit = Object.keys(transformedData).reduce((acc, key) => {
            // Include field if it's dirty (changed) or if it's a required field for the API
            if (dirtyFieldsMap[key] || ["id"].includes(key)) {
              acc[key] = transformedData[key];
            }
            return acc;
          }, {} as T);
        }

        await onSubmit(dataToSubmit, dirtyFieldsMap);
      } catch (error) {
        // Error handling is done by the parent component
        console.error("Form submission error:", error);
      }
    },
    [onSubmit, fields, shouldShowDirtyOnly, utils]
  );

  const renderField = useCallback(
    (field: FieldConfig) => {
      return <FieldRenderer key={field.name} field={field} form={form} />;
    },
    [form]
  );

  // Always declare hooks at top level
  const handleFieldChange = useCallback(
    (name: string, value: any) => {
      form.setValue(name as any, value, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form]
  );

  const handleLayoutSubmit = useCallback(
    (e?: React.FormEvent) => {
      // Handle both form submit events and direct calls
      if (e && typeof e.preventDefault === "function") {
        e.preventDefault();
      }
      // Trigger form submission
      form.handleSubmit(handleSubmit)();
    },
    [form, handleSubmit]
  );

  // Backward compatibility for customLayout
  if (customLayout) {
    return (
      <div className={className}>
        {customLayout({
          fields,
          formData: form.watch() as T,
          handleFieldChange,
          handleSubmit: handleLayoutSubmit,
          loading: isSubmitting || loading,
          error,
          renderField,
          initialData: formDefaultValues as Record<string, any>,
        })}
      </div>
    );
  }

  // Custom render
  if (customRender) {
    return (
      <div className={className}>
        {customRender({
          form,
          fields,
          renderField,
          isSubmitting: isSubmitting || loading,
          error,
        })}
      </div>
    );
  }

  // Grid layout classes
  const gridClassName = cn(
    "grid gap-4",
    columns === 2 && "md:grid-cols-2",
    columns === 3 && "md:grid-cols-3",
    columns === 4 && "md:grid-cols-4",
    layout === "horizontal" && "items-center"
  );

  const formContent = (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className={cn("space-y-4", formClassName)}
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className={gridClassName}>{fields.map(renderField)}</div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || loading}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={
            isSubmitting || loading || (!isDirty && shouldShowDirtyOnly)
          }
        >
          {isSubmitting || loading ? "Loading..." : submitText}
        </Button>
      </div>
    </form>
  );

  // With card wrapper
  if (title) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    );
  }

  // Without card wrapper
  return <div className={cn("w-full", className)}>{formContent}</div>;
}

// Export with proper generic typing
export const ApiForm = React.memo(ApiFormComponent) as <
  T extends FieldValues = FieldValues,
>(
  props: ApiFormProps<T>
) => JSX.Element;

// Default export for backward compatibility
export default ApiForm;

// Re-export types and utilities
export type {
  ApiFormProps,
  FieldConfig,
  InputFieldConfig,
  TextareaFieldConfig,
  SwitchFieldConfig,
  DatePickerFieldConfig,
  DropdownFieldConfig,
  CustomLayoutProps, // Backward compatibility
} from "./types";

export { generateSchema } from "./utils/validation";
export { useForm } from "./hooks/useForm";

// Backward compatibility - map old FormField to new FieldConfig
export type FormField = FieldConfig;
