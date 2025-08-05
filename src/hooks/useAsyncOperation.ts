import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";

export interface UseAsyncOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export interface UseAsyncOperationReturn<T = any> {
  isLoading: boolean;
  error: string | null;
  execute: (operation: () => Promise<T>) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Custom hook for managing async operations with consistent loading, error, and success handling
 *
 * @example
 * const { isLoading, execute } = useAsyncOperation({
 *   successMessage: "Operation completed successfully",
 *   errorMessage: "Operation failed"
 * });
 *
 * const handleSubmit = async () => {
 *   await execute(async () => {
 *     return await apiCall('/endpoint', { method: 'POST', body: data });
 *   });
 * };
 */
export function useAsyncOperation<T = any>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await operation();

        if (options.successMessage) {
          toast({
            title: "Success",
            description: options.successMessage,
          });
        }

        options.onSuccess?.();
        return result;
      } catch (err: any) {
        const errorMessage =
          err.message || options.errorMessage || "Operation failed";
        setError(errorMessage);

        if (options.errorMessage) {
          handleApiError(err, options.errorMessage);
        }

        options.onError?.(err);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset,
  };
}
