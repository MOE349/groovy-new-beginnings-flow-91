// Export all services from a single entry point
export { authService } from './auth.service';
export { dashboardService } from './dashboard.service';
export { assetService } from './asset.service';
export { workOrderService } from './workorder.service';
export { companyService } from './company.service';
export { userService } from './user.service';
export { analyticsService } from './analytics.service';
export { fileService } from './file.service';

// Export base API client for custom usage
export { apiClient, default as ApiClient } from './api.base';
export type { ApiResponse, ApiError, RequestConfig, PaginatedResponse } from './api.base';

// Re-export all service types
export type * from '../types/auth.types';
export type * from '../types/asset.types';
export type * from '../types/workorder.types';
export type * from '../types/common.types';

// Service container for dependency injection
export const services = {
  auth: authService,
  dashboard: dashboardService,
  asset: assetService,
  workOrder: workOrderService,
  company: companyService,
  user: userService,
  analytics: analyticsService,
  file: fileService,
} as const;

// Type for the services container
export type Services = typeof services;

// Helper to get all services
export function getAllServices(): Services {
  return services;
}

// Initialize all services (useful for app startup)
export function initializeServices(): void {
  // Add any initialization logic here if needed
  // For example, setting up interceptors, checking auth status, etc.
  
  console.info('All services initialized');
}