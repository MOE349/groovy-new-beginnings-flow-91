/**
 * Core API Client
 * Modern fetch wrapper with cancellation, timeout, retry, and interceptor support
 */

import { API_CONFIG } from "@/config/api";
import {
  ApiError,
  type ApiClientConfig,
  type ApiRequestConfig,
  type ApiResponse,
  type HttpMethod,
} from "./types";
import {
  InterceptorManager,
  createAuthInterceptor,
  createErrorInterceptor,
} from "./interceptors";
import { withRetry } from "./retry";

export class ApiClient {
  private _baseURL: string;
  private defaultTimeout: number;
  private interceptors: InterceptorManager;
  private abortControllers: Map<string, AbortController>;
  private requestCache: Map<string, { data: any; timestamp: number }>;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this._baseURL = config.baseURL || API_CONFIG.BASE_URL;
    this.defaultTimeout = config.timeout || API_CONFIG.TIMEOUT || 30000; // 30s fallback
    this.interceptors = new InterceptorManager();
    this.abortControllers = new Map();
    this.requestCache = new Map();

    // Set up default interceptors
    this.interceptors.useRequest(createAuthInterceptor());
    this.interceptors.useResponse(createErrorInterceptor());
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this._baseURL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => url.searchParams.append(key, String(item)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  /**
   * Create API error from response
   */
  private async createApiError(
    response: Response,
    message?: string
  ): Promise<ApiError> {
    let data: any;

    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch {
      data = null;
    }

    // Extract error message from the backend's specific format
    let errorMessage = message || `HTTP error! status: ${response.status}`;

    if (data && typeof data === "object") {
      // Handle the specific backend error format: { errors: { error: "message" } }
      if (data.errors?.error) {
        errorMessage = data.errors.error;
      } else if (data.error) {
        errorMessage =
          typeof data.error === "string"
            ? data.error
            : data.error.message || data.error;
      } else if (data.detail) {
        errorMessage = data.detail;
      } else if (data.message) {
        errorMessage = data.message;
      }
    }

    return new ApiError(
      errorMessage,
      response.status,
      response.statusText,
      response,
      data
    );
  }

  /**
   * Create timeout handling
   */
  private createTimeoutHandler(
    timeout: number,
    controller: AbortController
  ): { promise: Promise<never>; cleanup: () => void } {
    let timeoutId: NodeJS.Timeout;

    const promise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        const error = new ApiError("Request timeout", 0, "Timeout");
        error.code = "TIMEOUT";
        reject(error);
      }, timeout);
    });

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    return { promise, cleanup };
  }

  /**
   * Check cache for GET requests
   */
  private getCachedResponse<T>(cacheKey: string): ApiResponse<T> | null {
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
      return cached.data;
    }
    return null;
  }

  /**
   * Cache response for GET requests
   */
  private setCachedResponse<T>(cacheKey: string, response: ApiResponse<T>): void {
    this.requestCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    // Clean old cache entries (keep only last 50)
    if (this.requestCache.size > 50) {
      const entries = Array.from(this.requestCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, entries.length - 50).forEach(([key]) => {
        this.requestCache.delete(key);
      });
    }
  }

  /**
   * Core request method
   */
  async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    // Check cache for GET requests without body
    if (!config.method || config.method === 'GET') {
      const cacheKey = `${endpoint}${JSON.stringify(config.params || {})}`;
      const cached = this.getCachedResponse<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Generate unique request ID
    const requestId = `${endpoint}-${Date.now()}`;
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);

    try {
      // Run request interceptors
      const interceptedConfig = await this.interceptors.runRequestInterceptors({
        ...config,
        signal: config.signal || controller.signal,
      });

      const {
        params,
        timeout = this.defaultTimeout,
        retry,
        customHeaders = {},
        skipAuth,
        ...fetchConfig
      } = interceptedConfig;

      // Build URL
      const url = this.buildURL(endpoint, params);

      // Build headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...customHeaders,
        ...((fetchConfig.headers as Record<string, string>) || {}),
      };

      // Prepare request config
      const requestConfig: RequestInit = {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      };

      // Handle body serialization
      if (fetchConfig.body && typeof fetchConfig.body !== "string") {
        requestConfig.body = JSON.stringify(fetchConfig.body);
      }

      // Create fetch function for retry wrapper
      const fetchFn = async () => {
        // Create timeout handler
        const { promise: timeoutPromise, cleanup: cleanupTimeout } =
          this.createTimeoutHandler(timeout, controller);

        try {
          const response = await Promise.race([
            fetch(url, requestConfig),
            timeoutPromise,
          ]);

          // Clean up timeout since request completed
          cleanupTimeout();

          if (!response.ok) {
            throw await this.createApiError(response);
          }

          // Parse response
          let data: T;
          const contentType = response.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            data = await response.json();
          } else {
            data = (await response.text()) as T;
          }

          const apiResponse: ApiResponse<T> = {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          };

          const finalResponse = await this.interceptors.runResponseInterceptors(apiResponse);
          
          // Cache GET responses
          if (!config.method || config.method === 'GET') {
            const cacheKey = `${endpoint}${JSON.stringify(config.params || {})}`;
            this.setCachedResponse(cacheKey, finalResponse);
          }
          
          return finalResponse;
        } catch (error) {
          // Clean up timeout on error
          cleanupTimeout();
          throw error;
        }
      };

      // Execute with retry if configured
      if (retry) {
        return await withRetry(fetchFn, retry);
      }

      return await fetchFn();
    } catch (error) {
      // Run error interceptors
      if (error instanceof Error && "status" in error) {
        throw await this.interceptors.runResponseErrorInterceptors(
          error as ApiError
        );
      }
      throw error;
    } finally {
      // Clean up abort controller
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Cancel a specific request
   */
  cancel(endpoint: string): void {
    this.abortControllers.forEach((controller, key) => {
      if (key.startsWith(endpoint)) {
        controller.abort();
        this.abortControllers.delete(key);
      }
    });
  }

  /**
   * Cancel all pending requests
   */
  cancelAll(): void {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  /**
   * Clear request cache
   */
  clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Convenience methods
   */
  async get<T = any>(
    endpoint: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "POST", body: data });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "PUT", body: data });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data,
    });
  }

  async delete<T = any>(
    endpoint: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  /**
   * Get interceptor manager
   */
  get interceptor() {
    return this.interceptors;
  }

  /**
   * Get base URL
   */
  get baseURL() {
    return this._baseURL;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
