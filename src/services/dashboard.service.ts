import { apiClient } from './api.base';
import { mockApiClient } from './api.mock';
import { API_CONFIG } from '@/config/api';

export interface DashboardStats {
  totalAssets: number;
  assetsChange: string;
  activeWorkorders: number;
  workordersChange: string;
  revenue: string;
  revenueChange: string;
  utilization: number;
  utilizationChange: string;
}

export interface FleetStatus {
  total: number;
  operational: number;
  maintenance: number;
  outOfService: number;
}

export interface PerformanceMetrics {
  utilization: number;
  fuelEfficiency: number;
  onTimeDelivery: number;
  driverSatisfaction: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: 'asset' | 'workorder' | 'user' | 'system';
  userId?: string;
  userName?: string;
}

export interface Alert {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface DashboardData {
  stats: DashboardStats;
  fleetStatus: FleetStatus;
  performance: PerformanceMetrics;
  recentActivity: RecentActivity[];
  alerts: Alert[];
  workOrdersSummary: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  costSummary: {
    monthlyTotal: number;
    maintenanceCost: number;
    fuelCost: number;
    laborCost: number;
  };
}

class DashboardService {
  private get client() {
    return API_CONFIG.ENABLE_MOCK_DATA ? mockApiClient : apiClient;
  }

  /**
   * Get complete dashboard data
   */
  getDashboardData = async (): Promise<DashboardData> => {
    const response = await this.client.get<DashboardData>('/dashboard');
    return response.data;
  }

  /**
   * Get dashboard statistics only
   */
  async getStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }

  /**
   * Get fleet status
   */
  async getFleetStatus(): Promise<FleetStatus> {
    const response = await this.client.get<FleetStatus>('/dashboard/fleet-status');
    return response.data;
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await this.client.get<PerformanceMetrics>('/dashboard/performance');
    return response.data;
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const response = await this.client.get<RecentActivity[]>('/dashboard/activities', {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Get alerts
   */
  async getAlerts(unacknowledgedOnly: boolean = false): Promise<Alert[]> {
    const response = await this.client.get<Alert[]>('/dashboard/alerts', {
      params: { unacknowledged_only: unacknowledgedOnly },
    });
    return response.data;
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.client.post(`/dashboard/alerts/${alertId}/acknowledge`);
  }

  /**
   * Get work orders summary
   */
  async getWorkOrdersSummary(): Promise<DashboardData['workOrdersSummary']> {
    const response = await this.client.get('/dashboard/workorders-summary');
    return response.data;
  }

  /**
   * Get cost summary
   */
  async getCostSummary(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<DashboardData['costSummary']> {
    const response = await this.client.get('/dashboard/cost-summary', {
      params: { period },
    });
    return response.data;
  }

  /**
   * Get chart data for analytics
   */
  async getChartData(chartType: string, params?: Record<string, any>): Promise<any> {
    const response = await this.client.get(`/dashboard/charts/${chartType}`, {
      params,
    });
    return response.data;
  }
}

export const dashboardService = new DashboardService();