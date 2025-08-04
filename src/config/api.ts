export const API_CONFIG = {
  BASE_URL: "https://tenmil.api.alfrih.com/v1/api",
  TIMEOUT: 30000, // 30 seconds default timeout
} as const;

export const apiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
