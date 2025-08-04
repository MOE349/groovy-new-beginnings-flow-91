/**
 * API Interceptors Module
 * Handles request/response interception for auth, logging, and error handling
 */

import {
  type ApiRequestConfig,
  type ApiResponse,
  ApiError,
  type RequestInterceptor,
  type ResponseInterceptor,
} from "./types";

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  useRequest(interceptor: RequestInterceptor): number {
    this.requestInterceptors.push(interceptor);
    return this.requestInterceptors.length - 1;
  }

  useResponse(interceptor: ResponseInterceptor): number {
    this.responseInterceptors.push(interceptor);
    return this.responseInterceptors.length - 1;
  }

  ejectRequest(id: number): void {
    if (this.requestInterceptors[id]) {
      this.requestInterceptors.splice(id, 1);
    }
  }

  ejectResponse(id: number): void {
    if (this.responseInterceptors[id]) {
      this.responseInterceptors.splice(id, 1);
    }
  }

  async runRequestInterceptors(
    config: ApiRequestConfig
  ): Promise<ApiRequestConfig> {
    let finalConfig = config;

    for (const interceptor of this.requestInterceptors) {
      try {
        finalConfig = await interceptor(finalConfig);
      } catch (error) {
        throw error;
      }
    }

    return finalConfig;
  }

  async runResponseInterceptors(response: ApiResponse): Promise<ApiResponse> {
    let finalResponse = response;

    for (const interceptor of this.responseInterceptors) {
      try {
        if (interceptor.onFulfilled) {
          finalResponse = await interceptor.onFulfilled(finalResponse);
        }
      } catch (error) {
        if (interceptor.onRejected) {
          finalResponse = await interceptor.onRejected(error as ApiError);
        } else {
          throw error;
        }
      }
    }

    return finalResponse;
  }

  async runResponseErrorInterceptors(error: ApiError): Promise<any> {
    let finalError = error;

    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onRejected) {
        try {
          return await interceptor.onRejected(finalError);
        } catch (newError) {
          finalError = newError as ApiError;
        }
      }
    }

    throw finalError;
  }

  clearAll(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }
}

// Default auth interceptor
export const createAuthInterceptor = (): RequestInterceptor => {
  return (config: ApiRequestConfig): ApiRequestConfig => {
    if (!config.skipAuth) {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
    return config;
  };
};

// Default error interceptor
export const createErrorInterceptor = (): ResponseInterceptor => {
  return {
    onRejected: (error: ApiError) => {
      // Error message extraction is already handled in client.createApiError()
      // This interceptor is for additional error handling if needed

      // Log errors in development
      if (process.env.NODE_ENV === "development" && error.status >= 500) {
        console.error(
          `[API Error] ${error.status} ${error.message}`,
          error.data
        );
      }

      throw error;
    },
  };
};
