/**
 * Validation utilities for ApiForm
 * Provides Zod schema generation and validation helpers
 */

import { z } from "zod";
import type { FieldConfig } from "../types";

/**
 * Generate Zod schema from field configuration
 */
export function generateSchema(fields: FieldConfig[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "input":
        switch (field.inputType) {
          case "email":
            fieldSchema = z.string().email("Invalid email address");
            break;
          case "number":
            fieldSchema = z.coerce.number();
            if (field.min !== undefined) {
              fieldSchema = (fieldSchema as z.ZodNumber).min(
                field.min,
                `Must be at least ${field.min}`
              );
            }
            if (field.max !== undefined) {
              fieldSchema = (fieldSchema as z.ZodNumber).max(
                field.max,
                `Must be at most ${field.max}`
              );
            }
            break;
          case "url":
            fieldSchema = z.string().url("Invalid URL");
            break;
          case "tel":
            fieldSchema = z
              .string()
              .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number");
            break;
          default:
            fieldSchema = z.string();
            if (field.pattern) {
              fieldSchema = (fieldSchema as any).regex(
                new RegExp(field.pattern),
                "Invalid format"
              );
            }
        }
        break;

      case "textarea":
        fieldSchema = z.string();
        if (field.maxLength) {
          fieldSchema = (fieldSchema as any).max(
            field.maxLength,
            `Maximum ${field.maxLength} characters`
          );
        }
        break;

      case "switch":
        fieldSchema = z.boolean();
        break;

      case "datepicker":
        fieldSchema = z.date().or(z.string().transform((val) => new Date(val)));
        if (field.minDate) {
          fieldSchema = fieldSchema.refine(
            (date) => date >= field.minDate!,
            `Date must be after ${field.minDate!.toLocaleDateString()}`
          );
        }
        if (field.maxDate) {
          fieldSchema = fieldSchema.refine(
            (date) => date <= field.maxDate!,
            `Date must be before ${field.maxDate!.toLocaleDateString()}`
          );
        }
        break;

      case "dropdown":
        if (field.multiple) {
          fieldSchema = z.array(z.string());
        } else {
          fieldSchema = z.string();
        }
        break;

      default:
        fieldSchema = z.any();
    }

    // Apply required validation
    if (field.required) {
      if (
        field.type === "input" ||
        field.type === "textarea" ||
        field.type === "dropdown"
      ) {
        fieldSchema = fieldSchema.refine(
          (val) => val !== "" && val !== null && val !== undefined,
          `${field.label || field.name} is required`
        );
      }
    } else {
      // Make field optional if not required
      fieldSchema = fieldSchema.optional();
    }

    shape[field.name] = fieldSchema;
  });

  return z.object(shape);
}

/**
 * Validate a single field value
 */
export function validateField(
  field: FieldConfig,
  value: any,
  schema?: z.ZodObject<any>
): { isValid: boolean; error?: string } {
  if (schema && schema.shape[field.name]) {
    try {
      schema.shape[field.name].parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0]?.message };
      }
    }
  }

  // Basic validation if no schema provided
  if (field.required) {
    const isEmpty = value === "" || value === null || value === undefined;
    if (isEmpty) {
      return {
        isValid: false,
        error: `${field.label || field.name} is required`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Format validation errors for display
 */
export function formatErrors(errors: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};

  errors.errors.forEach((error) => {
    const path = error.path.join(".");
    if (!formatted[path]) {
      formatted[path] = error.message;
    }
  });

  return formatted;
}

/**
 * Get dirty fields by comparing current values with default values
 */
export function getDirtyFields<T extends Record<string, any>>(
  currentValues: T,
  defaultValues: Partial<T>
): Partial<Record<keyof T, boolean>> {
  const dirtyFields: Partial<Record<keyof T, boolean>> = {};

  Object.keys(currentValues).forEach((key) => {
    const currentValue = currentValues[key];
    const defaultValue = defaultValues[key];

    // Handle date comparison
    if ((currentValue as any) instanceof Date && (defaultValue as any) instanceof Date) {
      if ((currentValue as any).getTime() !== (defaultValue as any).getTime()) {
        (dirtyFields as any)[key] = true;
      }
    }
    // Handle object/array comparison
    else if (typeof currentValue === "object" && currentValue !== null) {
      if (JSON.stringify(currentValue) !== JSON.stringify(defaultValue)) {
        dirtyFields[key as keyof T] = true;
      }
    }
    // Handle primitive comparison
    else if (currentValue !== defaultValue) {
      dirtyFields[key as keyof T] = true;
    }
  });

  return dirtyFields;
}

/**
 * Transform form values for submission
 */
export function transformFormData<T extends Record<string, any>>(
  data: T,
  fields: FieldConfig[]
): T {
  const transformed = { ...data };

  fields.forEach((field) => {
    if (
      field.type === "datepicker" &&
      transformed[field.name] instanceof Date
    ) {
      // Convert Date to ISO string for API submission
      (transformed as any)[field.name] = ((transformed as any)[field.name] as Date)
        .toISOString()
        .split("T")[0];
    }
  });

  return transformed;
}
