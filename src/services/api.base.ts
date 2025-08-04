import { API_CONFIG, AUTH_CONFIG } from '@/config/api';
import { authInterceptor } from './auth.interceptor';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers?: Record<string, string>;
}

export interface ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;
  code?: string;
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
  skipAuth?: boolean;
  customHeaders?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta_data: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL: string = API_CONFIG.BASE_URL, timeout: number = API_CONFIG.TIMEOUT) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    return authInterceptor.getAuthHeader();
  }



  /**
   * Create timeout promise
   */
  private createTimeoutPromise(timeout: number): [Promise<never>, () => void] {
    let timeoutId: NodeJS.Timeout;
    
    const promise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeout);
    });
    
    const cancel = () => clearTimeout(timeoutId);
    
    return [promise, cancel];
  }

  /**
   * Make API request with retry logic
   */
  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      params,
      timeout = this.defaultTimeout,
      skipAuth = false,
      customHeaders = {},
      ...fetchConfig
    } = config;

    const url = this.buildURL(endpoint, params);
    
    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(!skipAuth && this.getAuthHeaders()),
      ...customHeaders,
      ...(fetchConfig.headers as Record<string, string> || {}),
    };

    // Prepare request
    const requestConfig: RequestInit = {
      ...fetchConfig,
      headers,
    };

    // Handle body serialization
    if (fetchConfig.body && typeof fetchConfig.body !== 'string') {
      requestConfig.body = JSON.stringify(fetchConfig.body);
    }

    try {
      // Create timeout
      const [timeoutPromise, cancelTimeout] = this.createTimeoutPromise(timeout);
      
      // Make request with timeout
      const response = await Promise.race([
        fetch(url, requestConfig),
        timeoutPromise,
      ]).finally(cancelTimeout);

      // Handle 401 Unauthorized
      if (response.status === 401 && !skipAuth && !authInterceptor.shouldSkipAuth(endpoint)) {
        try {
          const newToken = await authInterceptor.handle401();
          
          // Retry with new token
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, { ...requestConfig, headers });
          
          return this.handleResponse<T>(retryResponse);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: T;
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as T;
    }

    if (!response.ok) {
      const error = new Error('API request failed') as ApiError;
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = data;
      
      // Extract error message
      if (typeof data === 'object' && data !== null) {
        const errorData = data as any;
        error.message = errorData.errors?.error || 
                       errorData.error || 
                       errorData.message || 
                       error.message;
      }
      
      throw error;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  /**
   * Handle errors
   */
  private handleError(error: any): ApiError {
    if (error.status) {
      return error;
    }

    const apiError = new Error(error.message || 'Network error') as ApiError;
    apiError.status = 0;
    apiError.statusText = 'Network Error';
    
    return apiError;
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  async put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  async patch<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body: data });
  }

  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export default ApiClient;