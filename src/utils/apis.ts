import { API_CONFIG } from "@/config/api";

interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * Get the current subdomain from the window location
 */
const getSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // For localhost or direct IP access, no subdomain
  if (parts.length <= 2 || hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }
  
  return parts[0];
};

/**
 * Construct API URL based on tenant subdomain
 */
const getApiUrl = (endpoint: string): string => {
  // Tenant detection commented out for testing
  // const subdomain = getSubdomain();
  
  // Always use base URL for testing
  return `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // If subdomain is admin or null, use base URL
  // if (!subdomain || subdomain === 'admin') {
  //   return `${API_CONFIG.BASE_URL}${endpoint}`;
  // }
  
  // Otherwise, use tenant-specific URL
  // const baseUrlWithSubdomain = API_CONFIG.BASE_URL.replace('://', `://${subdomain}.`);
  // return `${baseUrlWithSubdomain}${endpoint}`;
};

/**
 * Generic API call function that handles tenant-based routing
 */
export const apiCall = async <T = any>(
  endpoint: string,
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>> => {
  const {
    method = 'GET',
    headers = {},
    body,
  } = options;

  const url = getApiUrl(endpoint);
  
  // Add authorization header if token exists
  const token = localStorage.getItem('access_token');
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    
    // Handle 401 unauthorized - redirect to login
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      throw new Error('Unauthorized - redirecting to login');
    }
    
    let data: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as T;
    }

    if (!response.ok) {
      // Try to extract error message from response data
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      if (data && typeof data === 'object') {
        // Check common error response formats
        const errorData = data as any;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error.message || errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].message || errorData.errors[0];
        }
      }
      
      throw new Error(errorMessage);
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

/**
 * Convenience methods for different HTTP verbs
 */
export const apiGet = <T = any>(endpoint: string, headers?: Record<string, string>) =>
  apiCall<T>(endpoint, { method: 'GET', headers });

export const apiPost = <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
  apiCall<T>(endpoint, { method: 'POST', body, headers });

export const apiPut = <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
  apiCall<T>(endpoint, { method: 'PUT', body, headers });

export const apiDelete = <T = any>(endpoint: string, headers?: Record<string, string>) =>
  apiCall<T>(endpoint, { method: 'DELETE', headers });

export const apiPatch = <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
  apiCall<T>(endpoint, { method: 'PATCH', body, headers });

/**
 * Get the current tenant info
 */
export const getCurrentTenant = () => {
  const subdomain = getSubdomain();
  return {
    subdomain,
    isAdmin: !subdomain || subdomain === 'admin',
    apiUrl: getApiUrl(''),
  };
};
