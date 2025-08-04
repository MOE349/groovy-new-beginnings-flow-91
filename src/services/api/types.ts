/**
 * API Client Types
 * Comprehensive type definitions for the API layer
 */

export interface ApiRequestConfig extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
  retry?: RetryConfig;
  skipAuth?: boolean;
  customHeaders?: Record<string, string>;
  signal?: AbortSignal;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public response?: Response;
  public data?: any;
  public code?: string;

  constructor(
    message: string,
    status: number,
    statusText: string,
    response?: Response,
    data?: any
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.response = response;
    this.data = data;
  }
}

export interface RetryConfig {
  retries?: number;
  retryDelay?: number | ((attempt: number) => number);
  retryCondition?: (error: ApiError) => boolean;
}

export interface InterceptorManager {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
}

export type RequestInterceptor = (
  config: ApiRequestConfig
) => ApiRequestConfig | Promise<ApiRequestConfig>;

export type ResponseInterceptor = {
  onFulfilled?: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;
  onRejected?: (error: ApiError) => any;
};

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retry?: RetryConfig;
  interceptors?: InterceptorManager;
}

// Token types
export interface TokenPair {
  access: string;
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
  expires_in?: number;
}

// Request method type
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";
