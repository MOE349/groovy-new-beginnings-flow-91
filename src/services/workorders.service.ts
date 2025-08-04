import { apiClient, PaginatedResponse } from './api.base';

export interface WorkOrder {
  id: string;
  code: string;
  asset: {
    id: string;
    name: string;
    location?: {
      id: string;
      name: string;
    };
  };
  status: {
    id: string;
    name: string;
  };
  maint_type?: string;
  priority?: string;
  suggested_start_date?: string;
  suggested_completion_date?: string;
  completion_end_date?: string;
  completion_meter_reading?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: {
    id: string;
    name: string;
  };
  assigned_to?: {
    id: string;
    name: string;
  };
}

export interface CreateWorkOrderDto {
  asset: string;
  status: string;
  maint_type?: string;
  priority?: string;
  suggested_start_date?: string;
  suggested_completion_date?: string;
  description?: string;
  assigned_to?: string;
}

export interface WorkOrderStatus {
  id: string;
  name: string;
  color?: string;
}

export interface WorkOrderFilters {
  status?: string;
  asset?: string;
  priority?: string;
  assigned_to?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

class WorkOrdersService {
  /**
   * Get all work orders with pagination
   */
  async getWorkOrders(filters?: WorkOrderFilters): Promise<PaginatedResponse<WorkOrder>> {
    const response = await apiClient.get<PaginatedResponse<WorkOrder>>('/work-orders/work-orders', {
      params: filters,
    });
    
    return response.data;
  }

  /**
   * Get single work order
   */
  async getWorkOrder(id: string): Promise<WorkOrder> {
    const response = await apiClient.get<WorkOrder>(`/work-orders/work-orders/${id}`);
    return response.data;
  }

  /**
   * Create work order
   */
  async createWorkOrder(data: CreateWorkOrderDto): Promise<WorkOrder> {
    const response = await apiClient.post<WorkOrder>('/work-orders/work-orders', data);
    return response.data;
  }

  /**
   * Update work order
   */
  async updateWorkOrder(id: string, data: Partial<CreateWorkOrderDto>): Promise<WorkOrder> {
    const response = await apiClient.patch<WorkOrder>(`/work-orders/work-orders/${id}`, data);
    return response.data;
  }

  /**
   * Delete work order
   */
  async deleteWorkOrder(id: string): Promise<void> {
    await apiClient.delete(`/work-orders/work-orders/${id}`);
  }

  /**
   * Get work order statuses
   */
  async getStatuses(): Promise<WorkOrderStatus[]> {
    const response = await apiClient.get<{ data: WorkOrderStatus[] }>('/work-orders/status');
    return response.data.data || response.data;
  }

  /**
   * Get work order statistics
   */
  async getWorkOrderStats(): Promise<{
    total: number;
    open: number;
    in_progress: number;
    completed: number;
    overdue: number;
  }> {
    const response = await apiClient.get('/work-orders/stats');
    return response.data;
  }

  /**
   * Assign work order to user
   */
  async assignWorkOrder(workOrderId: string, userId: string): Promise<WorkOrder> {
    const response = await apiClient.post<WorkOrder>(`/work-orders/work-orders/${workOrderId}/assign`, {
      user_id: userId,
    });
    return response.data;
  }

  /**
   * Add comment to work order
   */
  async addComment(workOrderId: string, comment: string): Promise<any> {
    const response = await apiClient.post(`/work-orders/work-orders/${workOrderId}/comments`, {
      comment,
    });
    return response.data;
  }

  /**
   * Get work order comments
   */
  async getComments(workOrderId: string): Promise<any[]> {
    const response = await apiClient.get(`/work-orders/work-orders/${workOrderId}/comments`);
    return response.data;
  }

  /**
   * Upload work order attachment
   */
  async uploadAttachment(workOrderId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/work-orders/work-orders/${workOrderId}/attachments`, formData, {
      customHeaders: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  /**
   * Complete work order
   */
  async completeWorkOrder(workOrderId: string, completionData: {
    completion_date: string;
    completion_meter_reading?: string;
    notes?: string;
  }): Promise<WorkOrder> {
    const response = await apiClient.post<WorkOrder>(`/work-orders/work-orders/${workOrderId}/complete`, completionData);
    return response.data;
  }
}

export const workOrdersService = new WorkOrdersService();