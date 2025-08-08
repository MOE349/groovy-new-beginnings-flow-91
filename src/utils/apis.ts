/**
 * API Utils - Backward Compatibility Layer
 * This file now redirects to the new modular API client
 * while maintaining the same interface for existing code
 */

// Re-export everything from the new API service
export {
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPatch,
  ApiError,
  type ApiResponse,
} from '@/services/api';

// Re-export getCurrentTenant for backward compatibility
export const getCurrentTenant = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // For localhost or direct IP access, no subdomain
  let subdomain: string | null = null;
  if (parts.length > 2 && hostname !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    subdomain = parts[0];
  }
  
  return {
    subdomain,
    isAdmin: !subdomain || subdomain === 'admin',
    apiUrl: '', // Deprecated; kept for compatibility
  };
};

export { computeApiBaseURL } from '@/config/api';
