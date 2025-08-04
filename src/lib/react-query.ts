import { QueryClient } from '@tanstack/react-query';
import { authInterceptor } from '@/services/auth.interceptor';

// Create a custom query client with auth-aware configuration
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutes - reduced for responsive updates
        gcTime: 15 * 60 * 1000, // 15 minutes - increased for better caching
        retry: (failureCount, error: any) => {
          // Don't retry on auth errors
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: 'always',
      },
      mutations: {
        retry: false,
        onError: (error: any) => {
          // Handle global mutation errors
          if (error?.status === 401) {
            // Auth interceptor will handle this
            return;
          }
        },
      },
    },
  });
};

// Export a default instance
export const queryClient = createQueryClient();

// Helper to invalidate all queries on logout
export const invalidateAllQueries = () => {
  queryClient.invalidateQueries();
  queryClient.clear();
};

// Helper to refetch queries after successful login
export const refetchOnLogin = () => {
  queryClient.invalidateQueries();
};

// Helper to pause/resume queries based on auth state
export const setQueriesEnabled = (enabled: boolean) => {
  queryClient.setDefaultOptions({
    queries: {
      ...queryClient.getDefaultOptions().queries,
      enabled,
    },
  });
};

// Add listener for auth state changes
window.addEventListener('storage', (e) => {
  if (e.key === 'access_token') {
    if (!e.newValue) {
      // Token was removed (logout)
      invalidateAllQueries();
    } else if (e.oldValue && e.newValue !== e.oldValue) {
      // Token was updated (refresh or new login)
      queryClient.invalidateQueries();
    }
  }
});