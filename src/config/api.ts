export const API_CONFIG = {
  BASE_URL: 'https://tenmil.api.alfrih.com/v1/api',
} as const;

export const apiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};