import { useState, useCallback } from 'react';
import { handleApiError } from '@/utils/errorHandling';
import { useNotifications } from '@/components/NotificationSystem';

interface UseApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface UseApiCallReturn<TData> {
  data: TData | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<TData | void>;
  reset: () => void;
}

export function useApiCall<TData = any>(
  apiFunction: (...args: any[]) => Promise<TData>,
  options: UseApiCallOptions = {}
): UseApiCallReturn<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { addNotification } = useNotifications();

  const execute = useCallback(
    async (...args: any[]): Promise<TData | void> => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunction(...args);
        setData(result);
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        if (options.showSuccessNotification) {
          addNotification({
            type: 'success',
            title: options.successMessage || 'Success',
            message: 'Operation completed successfully',
          });
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        if (options.showErrorNotification !== false) {
          handleApiError(error, options.errorMessage);
        }
        
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options, addNotification]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Variant for mutations (create, update, delete)
export function useApiMutation<TData = any, TVariables = any>(
  apiFunction: (variables: TVariables) => Promise<TData>,
  options: UseApiCallOptions = {}
): UseApiCallReturn<TData> & { mutate: (variables: TVariables) => Promise<TData | void> } {
  const apiCall = useApiCall(apiFunction, options);
  
  return {
    ...apiCall,
    mutate: apiCall.execute,
  };
}