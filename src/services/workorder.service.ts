import { apiClient } from './api.base';
import { API_CONFIG } from '@/config/api';
import { mockApiClient } from './api.mock';
import type {
  WorkOrder,
  WorkOrderStatus,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  WorkOrderTask,
  WorkOrderComment,
  WorkOrderAttachment,
  WorkOrderPart,
  WorkOrderLabor,
  WorkOrderFilters,
  WorkOrderStatistics,
  WorkOrderTemplate,
  WorkOrderPriority,
  MaintenanceType,
} from '@/types/workorder.types';
import type { PaginatedResponse } from './api.base';

class WorkOrderService {
  private get client() {
    return API_CONFIG.ENABLE_MOCK_DATA ? mockApiClient : apiClient;
  }

  // ========== Work Orders ==========

  /**
   * Get all work orders
   */
  async getWorkOrders(filters?: WorkOrderFilters): Promise<WorkOrder[]> {
    const response = await this.client.get<WorkOrder[]>('/work-orders/work-orders', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get paginated work orders
   */
  async getWorkOrdersPaginated(page: number = 1, pageSize: number = 20, filters?: WorkOrderFilters): Promise<PaginatedResponse<WorkOrder>> {
    const response = await this.client.get<PaginatedResponse<WorkOrder>>('/work-orders/work-orders', {
      params: { page, page_size: pageSize, ...filters },
    });
    return response.data;
  }

  /**
   * Get single work order by ID
   */
  async getWorkOrderById(id: string): Promise<WorkOrder> {
    const response = await this.client.get<WorkOrder>(`/work-orders/work-orders/${id}`);
    return response.data;
  }

  /**
   * Create new work order
   */
  async createWorkOrder(data: CreateWorkOrderDto): Promise<WorkOrder> {
    const response = await this.client.post<WorkOrder>('/work-orders/work-orders', data);
    return response.data;
  }

  /**
   * Update work order
   */
  async updateWorkOrder(id: string, data: UpdateWorkOrderDto): Promise<WorkOrder> {
    const response = await this.client.patch<WorkOrder>(`/work-orders/work-orders/${id}`, data);
    return response.data;
  }

  /**
   * Delete work order
   */
  async deleteWorkOrder(id: string): Promise<void> {
    await this.client.delete(`/work-orders/work-orders/${id}`);
  }

  /**
   * Get work order statistics
   */
  async getWorkOrderStatistics(filters?: WorkOrderFilters): Promise<WorkOrderStatistics> {
    const response = await this.client.get<WorkOrderStatistics>('/work-orders/statistics', {
      params: filters,
    });
    return response.data;
  }

  // ========== Work Order Status ==========

  /**
   * Get all work order statuses
   */
  async getWorkOrderStatuses(): Promise<WorkOrderStatus[]> {
    const response = await this.client.get<WorkOrderStatus[]>('/work-orders/status');
    return response.data;
  }

  /**
   * Create work order status
   */
  async createWorkOrderStatus(data: { name: string; color?: string; order?: number; is_closed?: boolean }): Promise<WorkOrderStatus> {
    const response = await this.client.post<WorkOrderStatus>('/work-orders/status', data);
    return response.data;
  }

  /**
   * Update work order status
   */
  async updateWorkOrderStatus(id: string, data: Partial<WorkOrderStatus>): Promise<WorkOrderStatus> {
    const response = await this.client.patch<WorkOrderStatus>(`/work-orders/status/${id}`, data);
    return response.data;
  }

  /**
   * Delete work order status
   */
  async deleteWorkOrderStatus(id: string): Promise<void> {
    await this.client.delete(`/work-orders/status/${id}`);
  }

  // ========== Tasks/Checklist ==========

  /**
   * Get work order tasks
   */
  async getWorkOrderTasks(workOrderId: string): Promise<WorkOrderTask[]> {
    const response = await this.client.get<WorkOrderTask[]>(`/work-orders/work-orders/${workOrderId}/tasks`);
    return response.data;
  }

  /**
   * Create work order task
   */
  async createWorkOrderTask(workOrderId: string, data: { description: string; order?: number }): Promise<WorkOrderTask> {
    const response = await this.client.post<WorkOrderTask>(`/work-orders/work-orders/${workOrderId}/tasks`, data);
    return response.data;
  }

  /**
   * Update work order task
   */
  async updateWorkOrderTask(workOrderId: string, taskId: string, data: Partial<WorkOrderTask>): Promise<WorkOrderTask> {
    const response = await this.client.patch<WorkOrderTask>(`/work-orders/work-orders/${workOrderId}/tasks/${taskId}`, data);
    return response.data;
  }

  /**
   * Complete work order task
   */
  async completeWorkOrderTask(workOrderId: string, taskId: string, notes?: string): Promise<WorkOrderTask> {
    const response = await this.client.post<WorkOrderTask>(`/work-orders/work-orders/${workOrderId}/tasks/${taskId}/complete`, { notes });
    return response.data;
  }

  /**
   * Delete work order task
   */
  async deleteWorkOrderTask(workOrderId: string, taskId: string): Promise<void> {
    await this.client.delete(`/work-orders/work-orders/${workOrderId}/tasks/${taskId}`);
  }

  // ========== Comments ==========

  /**
   * Get work order comments
   */
  async getWorkOrderComments(workOrderId: string): Promise<WorkOrderComment[]> {
    const response = await this.client.get<WorkOrderComment[]>(`/work-orders/work-orders/${workOrderId}/comments`);
    return response.data;
  }

  /**
   * Add work order comment
   */
  async addWorkOrderComment(workOrderId: string, data: { comment: string; is_internal?: boolean; mentioned_users?: string[] }): Promise<WorkOrderComment> {
    const response = await this.client.post<WorkOrderComment>(`/work-orders/work-orders/${workOrderId}/comments`, data);
    return response.data;
  }

  /**
   * Update work order comment
   */
  async updateWorkOrderComment(workOrderId: string, commentId: string, data: { comment: string }): Promise<WorkOrderComment> {
    const response = await this.client.patch<WorkOrderComment>(`/work-orders/work-orders/${workOrderId}/comments/${commentId}`, data);
    return response.data;
  }

  /**
   * Delete work order comment
   */
  async deleteWorkOrderComment(workOrderId: string, commentId: string): Promise<void> {
    await this.client.delete(`/work-orders/work-orders/${workOrderId}/comments/${commentId}`);
  }

  // ========== Attachments ==========

  /**
   * Get work order attachments
   */
  async getWorkOrderAttachments(workOrderId: string): Promise<WorkOrderAttachment[]> {
    const response = await this.client.get<WorkOrderAttachment[]>(`/work-orders/work-orders/${workOrderId}/attachments`);
    return response.data;
  }

  /**
   * Upload work order attachment
   */
  async uploadWorkOrderAttachment(workOrderId: string, file: File, description?: string): Promise<WorkOrderAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);

    const response = await this.client.post<WorkOrderAttachment>(`/work-orders/work-orders/${workOrderId}/attachments`, formData, {
      customHeaders: {
        'Content-Type': undefined as any,
      },
    });
    return response.data;
  }

  /**
   * Delete work order attachment
   */
  async deleteWorkOrderAttachment(workOrderId: string, attachmentId: string): Promise<void> {
    await this.client.delete(`/work-orders/work-orders/${workOrderId}/attachments/${attachmentId}`);
  }

  // ========== Parts ==========

  /**
   * Get work order parts
   */
  async getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
    const response = await this.client.get<WorkOrderPart[]>(`/work-orders/work-orders/${workOrderId}/parts`);
    return response.data;
  }

  /**
   * Add part to work order
   */
  async addWorkOrderPart(workOrderId: string, data: { part_id: string; quantity_used: number; notes?: string }): Promise<WorkOrderPart> {
    const response = await this.client.post<WorkOrderPart>(`/work-orders/work-orders/${workOrderId}/parts`, data);
    return response.data;
  }

  /**
   * Update work order part
   */
  async updateWorkOrderPart(workOrderId: string, partId: string, data: { quantity_used: number; notes?: string }): Promise<WorkOrderPart> {
    const response = await this.client.patch<WorkOrderPart>(`/work-orders/work-orders/${workOrderId}/parts/${partId}`, data);
    return response.data;
  }

  /**
   * Remove part from work order
   */
  async removeWorkOrderPart(workOrderId: string, partId: string): Promise<void> {
    await this.client.delete(`/work-orders/work-orders/${workOrderId}/parts/${partId}`);
  }

  // ========== Labor ==========

  /**
   * Get work order labor entries
   */
  async getWorkOrderLabor(workOrderId: string): Promise<WorkOrderLabor[]> {
    const response = await this.client.get<WorkOrderLabor[]>(`/work-orders/work-orders/${workOrderId}/labor`);
    return response.data;
  }

  /**
   * Add labor to work order
   */
  async addWorkOrderLabor(workOrderId: string, data: {
    technician_id: string;
    hours_worked: number;
    work_date: string;
    description?: string;
  }): Promise<WorkOrderLabor> {
    const response = await this.client.post<WorkOrderLabor>(`/work-orders/work-orders/${workOrderId}/labor`, data);
    return response.data;
  }

  /**
   * Update work order labor
   */
  async updateWorkOrderLabor(workOrderId: string, laborId: string, data: Partial<WorkOrderLabor>): Promise<WorkOrderLabor> {
    const response = await this.client.patch<WorkOrderLabor>(`/work-orders/work-orders/${workOrderId}/labor/${laborId}`, data);
    return response.data;
  }

  /**
   * Remove labor from work order
   */
  async removeWorkOrderLabor(workOrderId: string, laborId: string): Promise<void> {
    await this.client.delete(`/work-orders/work-orders/${workOrderId}/labor/${laborId}`);
  }

  // ========== Templates ==========

  /**
   * Get work order templates
   */
  async getWorkOrderTemplates(activeOnly?: boolean): Promise<WorkOrderTemplate[]> {
    const response = await this.client.get<WorkOrderTemplate[]>('/work-orders/templates', {
      params: { active_only: activeOnly },
    });
    return response.data;
  }

  /**
   * Get single work order template
   */
  async getWorkOrderTemplateById(id: string): Promise<WorkOrderTemplate> {
    const response = await this.client.get<WorkOrderTemplate>(`/work-orders/templates/${id}`);
    return response.data;
  }

  /**
   * Create work order template
   */
  async createWorkOrderTemplate(data: Partial<WorkOrderTemplate>): Promise<WorkOrderTemplate> {
    const response = await this.client.post<WorkOrderTemplate>('/work-orders/templates', data);
    return response.data;
  }

  /**
   * Update work order template
   */
  async updateWorkOrderTemplate(id: string, data: Partial<WorkOrderTemplate>): Promise<WorkOrderTemplate> {
    const response = await this.client.patch<WorkOrderTemplate>(`/work-orders/templates/${id}`, data);
    return response.data;
  }

  /**
   * Delete work order template
   */
  async deleteWorkOrderTemplate(id: string): Promise<void> {
    await this.client.delete(`/work-orders/templates/${id}`);
  }

  /**
   * Create work order from template
   */
  async createWorkOrderFromTemplate(templateId: string, data?: { asset_id: string; suggested_start_date?: string }): Promise<WorkOrder> {
    const response = await this.client.post<WorkOrder>(`/work-orders/templates/${templateId}/create-work-order`, data);
    return response.data;
  }

  // ========== Bulk Operations ==========

  /**
   * Bulk update work orders
   */
  async bulkUpdateWorkOrders(workOrderIds: string[], updates: Partial<WorkOrder>): Promise<WorkOrder[]> {
    const response = await this.client.patch<WorkOrder[]>('/work-orders/work-orders/bulk', {
      work_order_ids: workOrderIds,
      updates,
    });
    return response.data;
  }

  /**
   * Bulk assign work orders
   */
  async bulkAssignWorkOrders(workOrderIds: string[], assigneeId: string): Promise<WorkOrder[]> {
    const response = await this.client.post<WorkOrder[]>('/work-orders/work-orders/bulk-assign', {
      work_order_ids: workOrderIds,
      assignee_id: assigneeId,
    });
    return response.data;
  }

  // ========== Export ==========

  /**
   * Export work orders to CSV
   */
  async exportWorkOrders(filters?: WorkOrderFilters): Promise<Blob> {
    const response = await this.client.get<Blob>('/work-orders/work-orders/export', {
      params: filters,
      customHeaders: {
        'Accept': 'text/csv',
      },
    });
    return response.data;
  }
}

export const workOrderService = new WorkOrderService();