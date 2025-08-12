/**
 * ApiForm Component
 * Modular, performant form with React Hook Form and Zod validation
 */

import React, { useCallback, useEffect, useMemo } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldValues } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useForm } from "./hooks/useForm";
import { FieldRenderer } from "./components/FieldRenderer";
import { transformFormData } from "./utils/validation";
import type {
  ApiFormProps,
  FieldConfig,
  InputFieldConfig,
  DropdownFieldConfig,
} from "./types";

/**
 * Normalize default values according to FieldConfig definitions
 * - Dropdowns: coerce values to string; support object-with-id → id
 * - Multi-select dropdowns: coerce array values to string[]; support objects
 * - Date pickers: coerce string/number to Date
 * - Switches: coerce common truthy/falsey primitives to boolean
 * - Number inputs: coerce numeric strings to number
 */
function normalizeDefaultsByFields<
  T extends Record<string, unknown> | undefined
>(defaults: T, fields: FieldConfig[]): T {
  if (!defaults) return defaults;

  const normalized: Record<string, unknown> = {
    ...(defaults as Record<string, unknown>),
  };

  const fieldMap = new Map<string, FieldConfig>();
  for (const f of fields) fieldMap.set(f.name, f);

  for (const key of Object.keys(normalized)) {
    const value = normalized[key];
    const field = fieldMap.get(key);
    if (!field) continue;

    switch (field.type) {
      case "dropdown": {
        const coerceToString = (v: unknown) => {
          if (v == null) return v;
          if (
            typeof v === "object" &&
            v !== null &&
            "id" in (v as Record<string, unknown>)
          ) {
            return String(
              (v as Record<string, unknown>).id as unknown as string
            );
          }
          return String(v);
        };
        if ((field as DropdownFieldConfig).multiple) {
          if (Array.isArray(value)) {
            normalized[key] = (value as unknown[]).map((v) =>
              coerceToString(v)
            );
          }
        } else {
          normalized[key] = coerceToString(value);
        }
        break;
      }

      case "datepicker": {
        if (typeof value === "string") {
          // Handle plain YYYY-MM-DD as local date start of day
          const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/;
          normalized[key] = new Date(
            isoDateOnly.test(value) ? `${value}T00:00:00` : value
          );
        } else if (typeof value === "number") {
          normalized[key] = new Date(value);
        }
        break;
      }

      case "switch": {
        if (typeof value !== "boolean") {
          normalized[key] =
            value === true ||
            value === 1 ||
            value === "1" ||
            String(value).toLowerCase() === "true";
        }
        break;
      }

      case "input": {
        const inputType = (field as InputFieldConfig).inputType;
        if (
          inputType === "number" &&
          typeof value === "string" &&
          value.trim() !== ""
        ) {
          const n = Number(value);
          normalized[key] = Number.isNaN(n) ? value : n;
        }
        break;
      }

      default:
        break;
    }
  }

  return normalized as T;
}

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
  // Use initialData if provided for backward compatibility, normalized by fields
  const rawDefaults = defaultValues || initialData;
  const formDefaultValues = useMemo(
    () => normalizeDefaultsByFields(rawDefaults as any, fields),
    [rawDefaults, fields]
  );

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
      const normalized = normalizeDefaultsByFields(
        initialData as any,
        fields
      ) as unknown as T;
      form.reset(normalized);
    }
  }, [initialData, fields, form]);

  const handleSubmit = useCallback(
    async (data: T) => {
      try {
        // Merge in values that may not be registered fields (from custom layout)
        const customLayoutFields = [
          "is_online",
          "asset__is_online",
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

        const allValues = form.getValues() as Record<string, unknown>;
        const dataWithCustom: Record<string, unknown> = { ...(data as any) };
        for (const key of customLayoutFields) {
          if (
            dataWithCustom[key] === undefined &&
            allValues[key] !== undefined
          ) {
            dataWithCustom[key] = allValues[key];
          }
        }

        // Filter out system fields that shouldn't be in create/update requests
        const filteredData = (
          Object.keys(dataWithCustom) as Array<keyof T>
        ).reduce((acc, key) => {
          // Skip system-generated fields
          if (
            [
              "id",
              "created_at",
              "updated_at",
              "created_by",
              "updated_by",
            ].includes(key as unknown as string)
          ) {
            return acc;
          }
          // Include field if it's defined in fields array OR if it's from custom layout fields
          const fieldExists = fields.some(
            (field) => field.name === (key as unknown as string)
          );

          if (
            fieldExists ||
            customLayoutFields.includes(key as unknown as string)
          ) {
            (acc as any)[key] = (dataWithCustom as any)[key];
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
          dataToSubmit = (
            Object.keys(transformedData) as Array<keyof T>
          ).reduce((acc, key) => {
            // Include field if it's dirty (changed) or if it's a required field for the API
            if (
              (dirtyFieldsMap as any)[key] ||
              ["id"].includes(key as unknown as string)
            ) {
              (acc as any)[key] = (transformedData as any)[key];
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
    [onSubmit, fields, shouldShowDirtyOnly, utils, form]
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
          form,
          isSubmitting: isSubmitting || loading,
          isDirty,
          canSubmit: !(
            isSubmitting ||
            loading ||
            (!isDirty && shouldShowDirtyOnly)
          ),
          shouldShowDirtyOnly,
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
  T extends FieldValues = FieldValues
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
  FileManagerFieldConfig,
  CustomLayoutProps, // Backward compatibility
} from "./types";

export { generateSchema } from "./utils/validation";
export { useForm } from "./hooks/useForm";

// Backward compatibility - map old FormField to new FieldConfig
export type FormField = FieldConfig;
