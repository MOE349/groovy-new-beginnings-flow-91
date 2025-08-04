import { toast } from "@/hooks/use-toast";
import { ApiError } from "./apis";

interface ErrorData {
  errors?: {
    error?: string;
  };
  error?: string;
  message?: string;
}

/**
 * Centralized error handling utility for consistent error display across the app
 */
export const handleApiError = (error: unknown, customTitle?: string) => {
  let title = "Error";
  let description = "An unexpected error occurred";

  if (error instanceof ApiError) {
    // Use custom error handling for ApiError instances
    title = `Error ${error.status}`;
    
    // Extract the actual error message from the response data
    const errorData = error.data as ErrorData | undefined;
    if (errorData?.errors?.error) {
      description = errorData.errors.error;
    } else if (errorData?.error) {
      description = errorData.error;
    } else if (errorData?.message) {
      description = errorData.message;
    } else {
      description = error.message;
    }
  } else if (error && typeof error === 'object' && 'message' in error) {
    // Fallback for other error types
    description = (error as Error).message;
  } else if (typeof error === 'string') {
    description = error;
  }

  // Allow custom title override
  if (customTitle) {
    title = customTitle;
  }

  toast({
    title,
    description,
    variant: "destructive",
  });
};

/**
 * Higher-order function that wraps async operations with error handling
 */
export const withErrorHandling = <TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  customTitle?: string
) => {
  return async (...args: TArgs): Promise<TReturn | void> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleApiError(error, customTitle);
    }
  };
};