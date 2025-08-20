import { toast } from "@/hooks/use-toast";
import { ApiError } from "./apis";

/**
 * Parse error data from backend into title-content pairs
 * Backend errors come as:
 * - {"error": "some error"} - single error
 * - {"location": "this field is required"} - field-specific error
 * - {"field1": "error1", "field2": "error2"} - multiple errors
 * - "simple string error" - plain text error
 */
export const parseBackendError = (
  errorData: any
): Array<{ title: string; content: string }> => {
  // If it's a string, return as single error
  if (typeof errorData === "string") {
    return [{ title: "Error", content: errorData }];
  }

  // If it's not an object, convert to string and return
  if (!errorData || typeof errorData !== "object") {
    return [
      {
        title: "Error",
        content: String(errorData || "An unexpected error occurred"),
      },
    ];
  }

  const errorPairs: Array<{ title: string; content: string }> = [];

  // Handle nested error structures
  let dataToProcess = errorData;

  // Check for common nested structures
  if (errorData.errors && typeof errorData.errors === "object") {
    dataToProcess = errorData.errors;
  } else if (errorData.data && typeof errorData.data === "object") {
    dataToProcess = errorData.data;
  }

  // Extract key-value pairs from the error object
  for (const [key, value] of Object.entries(dataToProcess)) {
    let title = key;
    let content = String(value);

    // Capitalize and format the title
    title = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");

    // Handle array values (multiple errors for same field)
    if (Array.isArray(value)) {
      content = value.join(", ");
    }

    // Handle nested objects
    if (typeof value === "object" && value !== null) {
      if (value.message) {
        content = String(value.message);
      } else {
        content = JSON.stringify(value);
      }
    }

    errorPairs.push({ title, content });
  }

  // If no errors were extracted, return a generic error
  if (errorPairs.length === 0) {
    return [{ title: "Error", content: "An unexpected error occurred" }];
  }

  return errorPairs;
};

/**
 * Display multiple error messages as toasts
 */
export const showErrorToasts = (
  errors: Array<{ title: string; content: string }>
) => {
  errors.forEach(({ title, content }) => {
    toast({
      title,
      description: content,
      variant: "destructive",
    });
  });
};

/**
 * Centralized error handling utility for consistent error display across the app
 */
export const handleApiError = (error: any, customTitle?: string) => {
  let errorData: any = null;

  // Extract error data from different sources
  if (error instanceof ApiError) {
    errorData = error.data;
  } else if (error?.response?.data) {
    errorData = error.response.data;
  } else if (error?.data) {
    errorData = error.data;
  } else if (error?.message) {
    errorData = error.message;
  } else {
    errorData = error;
  }

  // Parse the error data into title-content pairs
  const errorPairs = parseBackendError(errorData);

  // If a custom title is provided, override the first error's title
  if (customTitle && errorPairs.length > 0) {
    errorPairs[0].title = customTitle;
  }

  // Display all errors as toasts
  showErrorToasts(errorPairs);
};

/**
 * Higher-order function that wraps async operations with error handling
 */
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  customTitle?: string
) => {
  return async (...args: T): Promise<R | void> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleApiError(error, customTitle);
    }
  };
};
