import { API_CONFIG } from '@/config/api';
import { mockDashboardData } from './mock/dashboard.mock';
import { ApiResponse } from './api.base';

// Mock API responses
const mockResponses: Record<string, any> = {
  '/dashboard': mockDashboardData,
  '/dashboard/stats': mockDashboardData.stats,
  '/dashboard/fleet-status': mockDashboardData.fleetStatus,
  '/dashboard/performance': mockDashboardData.performance,
  '/dashboard/activities': mockDashboardData.recentActivity,
  '/dashboard/alerts': mockDashboardData.alerts,
  '/dashboard/workorders-summary': mockDashboardData.workOrdersSummary,
  '/dashboard/cost-summary': mockDashboardData.costSummary,
};

// Mock delay to simulate network latency
const mockDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock API client for development
 */
export class MockApiClient {
  async request<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    await mockDelay();
    
    // Simulate random errors occasionally (5% chance)
    if (Math.random() < 0.05 && !API_CONFIG.ENABLE_MOCK_DATA) {
      throw new Error('Mock API Error: Random failure for testing');
    }
    
    const data = mockResponses[endpoint];
    
    if (!data) {
      throw new Error(`Mock API Error: No mock data for endpoint ${endpoint}`);
    }
    
    return {
      data: data as T,
      status: 200,
      statusText: 'OK',
    };
  }
  
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint);
  }
  
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    await mockDelay();
    
    // Handle specific POST endpoints
    if (endpoint.includes('/acknowledge')) {
      return {
        data: { success: true } as T,
        status: 200,
        statusText: 'OK',
      };
    }
    
    return this.request<T>(endpoint);
  }
  
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint);
  }
  
  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint);
  }
  
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    await mockDelay();
    return {
      data: { success: true } as T,
      status: 200,
      statusText: 'OK',
    };
  }
}

export const mockApiClient = new MockApiClient();