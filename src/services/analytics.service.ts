import { apiClient } from './api.base';
import { API_CONFIG } from '@/config/api';
import { mockApiClient } from './api.mock';

interface DateRange {
  start_date: string;
  end_date: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

interface ReportFilters extends DateRange {
  asset_id?: string;
  location_id?: string;
  site_id?: string;
  category_id?: string;
  user_id?: string;
  team_id?: string;
}

interface FleetUtilizationReport {
  overall_utilization: number;
  by_asset: Array<{
    asset_id: string;
    asset_name: string;
    utilization_rate: number;
    total_hours: number;
    idle_hours: number;
  }>;
  by_category: Record<string, number>;
  trend: ChartDataPoint[];
}

interface MaintenanceReport {
  total_work_orders: number;
  completed: number;
  pending: number;
  overdue: number;
  completion_rate: number;
  average_completion_time_hours: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  cost_breakdown: {
    total_cost: number;
    labor_cost: number;
    parts_cost: number;
    external_cost: number;
  };
  trend: ChartDataPoint[];
}

interface CostAnalysisReport {
  total_cost: number;
  cost_breakdown: {
    maintenance: number;
    fuel: number;
    labor: number;
    parts: number;
    other: number;
  };
  cost_per_asset: Array<{
    asset_id: string;
    asset_name: string;
    total_cost: number;
    cost_per_mile?: number;
    cost_per_hour?: number;
  }>;
  trend: ChartDataPoint[];
  forecast: ChartDataPoint[];
}

interface DowntimeReport {
  total_downtime_hours: number;
  planned_downtime: number;
  unplanned_downtime: number;
  availability_rate: number;
  mtbf: number; // Mean Time Between Failures
  mttr: number; // Mean Time To Repair
  by_asset: Array<{
    asset_id: string;
    asset_name: string;
    downtime_hours: number;
    incidents: number;
  }>;
  by_cause: Record<string, number>;
  trend: ChartDataPoint[];
}

interface ComplianceReport {
  compliance_rate: number;
  upcoming_inspections: Array<{
    asset_id: string;
    asset_name: string;
    inspection_type: string;
    due_date: string;
    days_until_due: number;
  }>;
  expired_documents: Array<{
    asset_id: string;
    asset_name: string;
    document_type: string;
    expired_date: string;
    days_overdue: number;
  }>;
  certification_status: Record<string, { compliant: number; non_compliant: number }>;
}

interface CustomReport {
  id: string;
  name: string;
  description?: string;
  report_type: string;
  filters: any;
  columns: string[];
  grouping?: string[];
  sorting?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  created_by: string;
  is_public: boolean;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}

class AnalyticsService {
  private get client() {
    return API_CONFIG.ENABLE_MOCK_DATA ? mockApiClient : apiClient;
  }

  // ========== Standard Reports ==========

  /**
   * Get fleet utilization report
   */
  async getFleetUtilizationReport(filters: ReportFilters): Promise<FleetUtilizationReport> {
    const response = await this.client.get<FleetUtilizationReport>('/analytics/reports/fleet-utilization', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get maintenance report
   */
  async getMaintenanceReport(filters: ReportFilters): Promise<MaintenanceReport> {
    const response = await this.client.get<MaintenanceReport>('/analytics/reports/maintenance', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get cost analysis report
   */
  async getCostAnalysisReport(filters: ReportFilters): Promise<CostAnalysisReport> {
    const response = await this.client.get<CostAnalysisReport>('/analytics/reports/cost-analysis', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get downtime report
   */
  async getDowntimeReport(filters: ReportFilters): Promise<DowntimeReport> {
    const response = await this.client.get<DowntimeReport>('/analytics/reports/downtime', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(filters?: Partial<ReportFilters>): Promise<ComplianceReport> {
    const response = await this.client.get<ComplianceReport>('/analytics/reports/compliance', {
      params: filters,
    });
    return response.data;
  }

  // ========== Chart Data ==========

  /**
   * Get chart data
   */
  async getChartData(chartType: string, filters: ReportFilters): Promise<{
    data: ChartDataPoint[];
    metadata: {
      title: string;
      x_axis_label: string;
      y_axis_label: string;
      chart_type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    };
  }> {
    const response = await this.client.get(`/analytics/charts/${chartType}`, {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get KPI metrics
   */
  async getKPIMetrics(filters?: Partial<ReportFilters>): Promise<Array<{
    name: string;
    value: number | string;
    change: number;
    trend: 'up' | 'down' | 'stable';
    unit?: string;
  }>> {
    const response = await this.client.get('/analytics/kpis', {
      params: filters,
    });
    return response.data;
  }

  // ========== Custom Reports ==========

  /**
   * Get custom reports
   */
  async getCustomReports(): Promise<CustomReport[]> {
    const response = await this.client.get<CustomReport[]>('/analytics/custom-reports');
    return response.data;
  }

  /**
   * Get custom report by ID
   */
  async getCustomReportById(id: string): Promise<CustomReport> {
    const response = await this.client.get<CustomReport>(`/analytics/custom-reports/${id}`);
    return response.data;
  }

  /**
   * Create custom report
   */
  async createCustomReport(data: Omit<CustomReport, 'id' | 'created_by'>): Promise<CustomReport> {
    const response = await this.client.post<CustomReport>('/analytics/custom-reports', data);
    return response.data;
  }

  /**
   * Update custom report
   */
  async updateCustomReport(id: string, data: Partial<CustomReport>): Promise<CustomReport> {
    const response = await this.client.patch<CustomReport>(`/analytics/custom-reports/${id}`, data);
    return response.data;
  }

  /**
   * Delete custom report
   */
  async deleteCustomReport(id: string): Promise<void> {
    await this.client.delete(`/analytics/custom-reports/${id}`);
  }

  /**
   * Run custom report
   */
  async runCustomReport(id: string, filters?: any): Promise<{
    data: any[];
    total: number;
    metadata: any;
  }> {
    const response = await this.client.post(`/analytics/custom-reports/${id}/run`, {
      filters,
    });
    return response.data;
  }

  // ========== Export ==========

  /**
   * Export report to PDF
   */
  async exportReportToPDF(reportType: string, filters: ReportFilters, options?: {
    include_charts?: boolean;
    include_summary?: boolean;
    paper_size?: 'A4' | 'Letter';
  }): Promise<Blob> {
    const response = await this.client.post<Blob>(`/analytics/reports/${reportType}/export/pdf`, {
      filters,
      options,
    }, {
      customHeaders: {
        'Accept': 'application/pdf',
      },
    });
    return response.data;
  }

  /**
   * Export report to Excel
   */
  async exportReportToExcel(reportType: string, filters: ReportFilters): Promise<Blob> {
    const response = await this.client.post<Blob>(`/analytics/reports/${reportType}/export/excel`, {
      filters,
    }, {
      customHeaders: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    return response.data;
  }

  /**
   * Export custom report
   */
  async exportCustomReport(id: string, format: 'csv' | 'excel' | 'pdf', filters?: any): Promise<Blob> {
    const response = await this.client.post<Blob>(`/analytics/custom-reports/${id}/export`, {
      format,
      filters,
    }, {
      customHeaders: {
        'Accept': format === 'pdf' ? 'application/pdf' : 
                 format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                 'text/csv',
      },
    });
    return response.data;
  }

  // ========== Report Scheduling ==========

  /**
   * Schedule report
   */
  async scheduleReport(data: {
    report_type: string;
    filters: any;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'excel';
    time?: string; // HH:MM format
    day_of_week?: number; // 0-6 for weekly
    day_of_month?: number; // 1-31 for monthly
  }): Promise<{ id: string; next_run: string }> {
    const response = await this.client.post('/analytics/scheduled-reports', data);
    return response.data;
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(): Promise<Array<{
    id: string;
    report_type: string;
    frequency: string;
    recipients: string[];
    next_run: string;
    last_run?: string;
    is_active: boolean;
  }>> {
    const response = await this.client.get('/analytics/scheduled-reports');
    return response.data;
  }

  /**
   * Update scheduled report
   */
  async updateScheduledReport(id: string, data: any): Promise<void> {
    await this.client.patch(`/analytics/scheduled-reports/${id}`, data);
  }

  /**
   * Delete scheduled report
   */
  async deleteScheduledReport(id: string): Promise<void> {
    await this.client.delete(`/analytics/scheduled-reports/${id}`);
  }

  // ========== Data Analysis ==========

  /**
   * Get predictive maintenance insights
   */
  async getPredictiveMaintenanceInsights(assetId?: string): Promise<Array<{
    asset_id: string;
    asset_name: string;
    predicted_failure_date?: string;
    confidence_score: number;
    recommended_action: string;
    estimated_cost_savings: number;
  }>> {
    const response = await this.client.get('/analytics/insights/predictive-maintenance', {
      params: { asset_id: assetId },
    });
    return response.data;
  }

  /**
   * Get cost optimization suggestions
   */
  async getCostOptimizationSuggestions(): Promise<Array<{
    category: string;
    suggestion: string;
    potential_savings: number;
    implementation_effort: 'low' | 'medium' | 'high';
    priority: number;
  }>> {
    const response = await this.client.get('/analytics/insights/cost-optimization');
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();