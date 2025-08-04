/**
 * API Service Main Export
 * Provides backward compatibility while using new client internally
 */

import { apiClient } from "./client";
import { ApiError, type ApiResponse } from "./types";

// Re-export types and classes
export * from "./types";
export { apiClient } from "./client";
export { withRetry, exponentialBackoff, linearBackoff } from "./retry";
export {
  InterceptorManager,
  createAuthInterceptor,
  createErrorInterceptor,
} from "./interceptors";

// Token refresh logic (separate from main client to avoid circular dependencies)
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await apiClient.post<{
        access: string;
        refresh?: string;
      }>("/token/refresh/", { refresh: refreshToken }, { skipAuth: true });

      const newAccessToken = response.data.access;

      if (newAccessToken) {
        localStorage.setItem("access_token", newAccessToken);
        if (response.data.refresh) {
          localStorage.setItem("refresh_token", response.data.refresh);
        }
        return newAccessToken;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    return null;
  })();

  // Reset the promise after completion
  refreshPromise.finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// Add 401 handling interceptor
apiClient.interceptor.useResponse({
  onRejected: async (error: ApiError) => {
    if (
      error.status === 401 &&
      !error.response?.url.includes("/auth/refresh") &&
      !error.response?.url.includes("/users/login")
    ) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        // Retry the original request with new token
        const originalUrl = error.response?.url;
        if (originalUrl) {
          const endpoint = originalUrl.replace(apiClient.baseURL, "");
          return apiClient.request(endpoint, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });
        }
      }

      // If refresh failed, clear tokens and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");

      // Use replace to prevent back button issues
      window.location.replace("/login");

      // Return a promise that never resolves to prevent further execution
      return new Promise(() => {});
    }

    throw error;
  },
});

/**
 * Backward compatible apiCall function
 * Maps old API to new client
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: Record<string, string>;
    body?: any;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", headers, body } = options;

  try {
    return await apiClient.request<T>(endpoint, {
      method,
      body,
      customHeaders: headers,
    });
  } catch (error) {
    // Ensure error maintains backward compatibility
    if (error instanceof Error && "status" in error) {
      const apiError = error as ApiError;
      // Backward compatible error shape
      throw apiError;
    }
    throw error;
  }
}

// Convenience methods for backward compatibility
export const apiGet = <T = any>(
  endpoint: string,
  headers?: Record<string, string>
) => apiCall<T>(endpoint, { method: "GET", headers });

export const apiPost = <T = any>(
  endpoint: string,
  body?: any,
  headers?: Record<string, string>
) => apiCall<T>(endpoint, { method: "POST", body, headers });

export const apiPut = <T = any>(
  endpoint: string,
  body?: any,
  headers?: Record<string, string>
) => apiCall<T>(endpoint, { method: "PUT", body, headers });

export const apiDelete = <T = any>(
  endpoint: string,
  headers?: Record<string, string>
) => apiCall<T>(endpoint, { method: "DELETE", headers });

export const apiPatch = <T = any>(
  endpoint: string,
  body?: any,
  headers?: Record<string, string>
) => apiCall<T>(endpoint, { method: "PATCH", body, headers });

// Export class for custom instances
export { ApiClient } from "./client";
