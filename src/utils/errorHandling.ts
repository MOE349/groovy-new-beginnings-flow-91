import { toast } from "@/hooks/use-toast";
import { ApiError } from "./apis";

/**
 * Centralized error handling utility for consistent error display across the app
 */
export const handleApiError = (error: any, customTitle?: string) => {
  let title = "Error";
  let description = "An unexpected error occurred";

  if (error instanceof ApiError) {
    // Use custom error handling for ApiError instances
    title = `Error ${error.status}`;
    description = error.message;
  } else if (error?.message) {
    // Fallback for other error types
    description = error.message;
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