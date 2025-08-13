/**
 * useForm Hook
 * Main form hook that integrates with React Hook Form
 */

import {
  useForm as useReactHookForm,
  UseFormReturn as RHFUseFormReturn,
  FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import React from "react";
import { z } from "zod";
import type { FormConfig, FormUtils, ValidationResult } from "../types";
import {
  generateSchema,
  getDirtyFields,
  transformFormData,
} from "../utils/validation";

export interface UseFormOptions<T extends FieldValues = FieldValues>
  extends FormConfig<T> {
  mode?: "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all";
  reValidateMode?: "onChange" | "onBlur" | "onSubmit";
  onChange?: (data: T) => void;
}

export interface UseFormReturn<T extends FieldValues = FieldValues> {
  form: RHFUseFormReturn<T>;
  utils: FormUtils<T>;
  isSubmitting: boolean;
  isDirty: boolean;
  dirtyFields: Partial<Record<keyof T, boolean>>;
}

export function useForm<T extends FieldValues = FieldValues>({
  fields,
  schema,
  defaultValues,
  mode = "onSubmit",
  reValidateMode = "onChange",
  onChange,
}: UseFormOptions<T>): UseFormReturn<T> {
  // Generate schema from fields if not provided
  const formSchema = schema || (generateSchema(fields) as z.ZodType<T>);

  // Track the current baseline for dirty field comparison
  const [currentBaseline, setCurrentBaseline] = React.useState(defaultValues);

  // Initialize React Hook Form
  const form = useReactHookForm<T>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues as any,
    mode,
    reValidateMode,
  });

  const {
    reset,
    setValue,
    setError,
    clearErrors,
    trigger,
    getValues,
    formState: { isSubmitting, isDirty, dirtyFields },
    watch,
  } = form;

  // Watch form changes
  useEffect(() => {
    if (onChange) {
      const subscription = watch((data) => {
        onChange(data as T);
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, onChange]);

  // Form utilities
  const utils: FormUtils<T> = {
    reset: useCallback(
      (values?: Partial<T>) => {
        reset(values as any);
        setCurrentBaseline(values || defaultValues);
      },
      [reset, defaultValues]
    ),

    resetDirtyFields: useCallback(
      (values?: Partial<T>) => {
        const newBaseline = values || getValues();
        setCurrentBaseline(newBaseline);
        reset(newBaseline as any);
      },
      [reset, getValues]
    ),

    setFieldValue: useCallback(
      (name: any, value: any) => {
        setValue(name, value, { shouldValidate: true, shouldDirty: true });
      },
      [setValue]
    ),

    setFieldError: useCallback(
      (name: any, error: string) => {
        setError(name, { type: "manual", message: error });
      },
      [setError]
    ),

    clearErrors: useCallback(() => {
      clearErrors();
    }, [clearErrors]),

    validate: useCallback(async (): Promise<ValidationResult> => {
      const isValid = await trigger();
      const errors: Record<string, string> = {};

      if (!isValid && form.formState.errors) {
        Object.entries(form.formState.errors).forEach(([key, error]) => {
          if (error?.message) {
            errors[key] = error.message;
          }
        });
      }

      return { isValid, errors };
    }, [trigger, form.formState.errors]),

    getValues: useCallback(() => {
      return getValues();
    }, [getValues]),

    getDirtyFields: useCallback(() => {
      return getDirtyFields(getValues(), currentBaseline || {});
    }, [getValues, currentBaseline]),
  };

  return {
    form,
    utils,
    isSubmitting,
    isDirty,
    dirtyFields,
  };
}
