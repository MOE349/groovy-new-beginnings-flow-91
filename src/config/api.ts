// API Configuration with environment variables
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://tenmil.api.alfrih.com/v1/api',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' || (!import.meta.env.VITE_ENABLE_MOCK_DATA && import.meta.env.DEV),
} as const;

// Application Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'TenMil Fleet Management',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  TENANT_MODE: import.meta.env.VITE_TENANT_MODE !== 'false',
  DEFAULT_TENANT: import.meta.env.VITE_DEFAULT_TENANT || '',
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_REFRESH_INTERVAL: Number(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 3600000, // 1 hour
  SESSION_TIMEOUT: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 7200000, // 2 hours
} as const;

// Localization Configuration
export const LOCALE_CONFIG = {
  DEFAULT_LOCALE: import.meta.env.VITE_DEFAULT_LOCALE || 'en',
  SUPPORTED_LOCALES: (import.meta.env.VITE_SUPPORTED_LOCALES || 'en').split(','),
} as const;

// Feature Flags
export const FEATURES = {
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  BILLING: import.meta.env.VITE_ENABLE_BILLING !== 'false',
  ADVANCED_REPORTING: import.meta.env.VITE_ENABLE_ADVANCED_REPORTING !== 'false',
} as const;

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_DEV_TOOLS: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'error',
} as const;

export const apiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};