import { apiClient } from './api.base';
import { API_CONFIG } from '@/config/api';
import { mockApiClient } from './api.mock';
import type {
  Asset,
  Equipment,
  Attachment,
  AssetCategory,
  WeightClass,
  Location,
  Site,
  CreateEquipmentDto,
  CreateAttachmentDto,
  UpdateAssetDto,
  AssetFilters,
  AssetStatistics,
  AssetHistoryEntry,
  AssetDocument,
} from '@/types/asset.types';
import type { PaginatedResponse } from './api.base';

class AssetService {
  private get client() {
    return API_CONFIG.ENABLE_MOCK_DATA ? mockApiClient : apiClient;
  }

  // ========== Assets (Combined) ==========

  /**
   * Get all assets (equipment and attachments)
   */
  async getAssets(filters?: AssetFilters): Promise<Asset[]> {
    const response = await this.client.get<Asset[]>('/assets/assets', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get paginated assets
   */
  async getAssetsPaginated(page: number = 1, pageSize: number = 20, filters?: AssetFilters): Promise<PaginatedResponse<Asset>> {
    const response = await this.client.get<PaginatedResponse<Asset>>('/assets/assets', {
      params: { page, page_size: pageSize, ...filters },
    });
    return response.data;
  }

  /**
   * Get single asset by ID
   */
  async getAssetById(id: string): Promise<Asset> {
    const response = await this.client.get<Asset>(`/assets/assets/${id}`);
    return response.data;
  }

  /**
   * Delete asset
   */
  async deleteAsset(id: string): Promise<void> {
    await this.client.delete(`/assets/assets/${id}`);
  }

  /**
   * Get asset statistics
   */
  async getAssetStatistics(filters?: AssetFilters): Promise<AssetStatistics> {
    const response = await this.client.get<AssetStatistics>('/assets/statistics', {
      params: filters,
    });
    return response.data;
  }

  // ========== Equipment ==========

  /**
   * Get all equipment
   */
  async getEquipment(filters?: AssetFilters): Promise<Equipment[]> {
    const response = await this.client.get<Equipment[]>('/assets/equipment', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get single equipment by ID
   */
  async getEquipmentById(id: string): Promise<Equipment> {
    const response = await this.client.get<Equipment>(`/assets/equipment/${id}`);
    return response.data;
  }

  /**
   * Create new equipment
   */
  async createEquipment(data: CreateEquipmentDto): Promise<Equipment> {
    const response = await this.client.post<Equipment>('/assets/equipment', data);
    return response.data;
  }

  /**
   * Update equipment
   */
  async updateEquipment(id: string, data: UpdateAssetDto): Promise<Equipment> {
    const response = await this.client.patch<Equipment>(`/assets/equipment/${id}`, data);
    return response.data;
  }

  /**
   * Delete equipment
   */
  async deleteEquipment(id: string): Promise<void> {
    await this.client.delete(`/assets/equipment/${id}`);
  }

  // ========== Attachments ==========

  /**
   * Get all attachments
   */
  async getAttachments(filters?: AssetFilters): Promise<Attachment[]> {
    const response = await this.client.get<Attachment[]>('/assets/attachments', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get single attachment by ID
   */
  async getAttachmentById(id: string): Promise<Attachment> {
    const response = await this.client.get<Attachment>(`/assets/attachments/${id}`);
    return response.data;
  }

  /**
   * Create new attachment
   */
  async createAttachment(data: CreateAttachmentDto): Promise<Attachment> {
    const response = await this.client.post<Attachment>('/assets/attachments', data);
    return response.data;
  }

  /**
   * Update attachment
   */
  async updateAttachment(id: string, data: UpdateAssetDto): Promise<Attachment> {
    const response = await this.client.patch<Attachment>(`/assets/attachments/${id}`, data);
    return response.data;
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(id: string): Promise<void> {
    await this.client.delete(`/assets/attachments/${id}`);
  }

  /**
   * Get attachments for specific equipment
   */
  async getEquipmentAttachments(equipmentId: string): Promise<Attachment[]> {
    const response = await this.client.get<Attachment[]>(`/assets/equipment/${equipmentId}/attachments`);
    return response.data;
  }

  // ========== Categories ==========

  /**
   * Get equipment categories
   */
  async getEquipmentCategories(): Promise<AssetCategory[]> {
    const response = await this.client.get<AssetCategory[]>('/assets/equipment_category');
    return response.data;
  }

  /**
   * Create equipment category
   */
  async createEquipmentCategory(data: { name: string; slug: string; description?: string }): Promise<AssetCategory> {
    const response = await this.client.post<AssetCategory>('/assets/equipment_category', data);
    return response.data;
  }

  /**
   * Update equipment category
   */
  async updateEquipmentCategory(id: string, data: Partial<AssetCategory>): Promise<AssetCategory> {
    const response = await this.client.patch<AssetCategory>(`/assets/equipment_category/${id}`, data);
    return response.data;
  }

  /**
   * Delete equipment category
   */
  async deleteEquipmentCategory(id: string): Promise<void> {
    await this.client.delete(`/assets/equipment_category/${id}`);
  }

  /**
   * Get attachment categories
   */
  async getAttachmentCategories(): Promise<AssetCategory[]> {
    const response = await this.client.get<AssetCategory[]>('/assets/attachment_category');
    return response.data;
  }

  /**
   * Create attachment category
   */
  async createAttachmentCategory(data: { name: string; slug: string; description?: string }): Promise<AssetCategory> {
    const response = await this.client.post<AssetCategory>('/assets/attachment_category', data);
    return response.data;
  }

  /**
   * Update attachment category
   */
  async updateAttachmentCategory(id: string, data: Partial<AssetCategory>): Promise<AssetCategory> {
    const response = await this.client.patch<AssetCategory>(`/assets/attachment_category/${id}`, data);
    return response.data;
  }

  /**
   * Delete attachment category
   */
  async deleteAttachmentCategory(id: string): Promise<void> {
    await this.client.delete(`/assets/attachment_category/${id}`);
  }

  // ========== Weight Classes ==========

  /**
   * Get equipment weight classes
   */
  async getWeightClasses(): Promise<WeightClass[]> {
    const response = await this.client.get<WeightClass[]>('/assets/equipment_weight_class');
    return response.data;
  }

  // ========== History ==========

  /**
   * Get asset history
   */
  async getAssetHistory(assetId: string, limit?: number): Promise<AssetHistoryEntry[]> {
    const response = await this.client.get<AssetHistoryEntry[]>(`/assets/assets/${assetId}/history`, {
      params: { limit },
    });
    return response.data;
  }

  // ========== Documents ==========

  /**
   * Get asset documents
   */
  async getAssetDocuments(assetId: string): Promise<AssetDocument[]> {
    const response = await this.client.get<AssetDocument[]>(`/assets/assets/${assetId}/documents`);
    return response.data;
  }

  /**
   * Upload asset document
   */
  async uploadAssetDocument(assetId: string, file: File, data?: { category?: string; description?: string }): Promise<AssetDocument> {
    const formData = new FormData();
    formData.append('file', file);
    if (data?.category) formData.append('category', data.category);
    if (data?.description) formData.append('description', data.description);

    const response = await this.client.post<AssetDocument>(`/assets/assets/${assetId}/documents`, formData, {
      customHeaders: {
        'Content-Type': undefined as any, // Let browser set multipart/form-data
      },
    });
    return response.data;
  }

  /**
   * Delete asset document
   */
  async deleteAssetDocument(assetId: string, documentId: string): Promise<void> {
    await this.client.delete(`/assets/assets/${assetId}/documents/${documentId}`);
  }

  // ========== Bulk Operations ==========

  /**
   * Bulk update assets
   */
  async bulkUpdateAssets(assetIds: string[], updates: Partial<Asset>): Promise<Asset[]> {
    const response = await this.client.patch<Asset[]>('/assets/assets/bulk', {
      asset_ids: assetIds,
      updates,
    });
    return response.data;
  }

  /**
   * Bulk delete assets
   */
  async bulkDeleteAssets(assetIds: string[]): Promise<void> {
    await this.client.post('/assets/assets/bulk-delete', {
      asset_ids: assetIds,
    });
  }

  // ========== Import/Export ==========

  /**
   * Export assets to CSV
   */
  async exportAssets(filters?: AssetFilters): Promise<Blob> {
    const response = await this.client.get<Blob>('/assets/assets/export', {
      params: filters,
      customHeaders: {
        'Accept': 'text/csv',
      },
    });
    return response.data;
  }

  /**
   * Import assets from CSV
   */
  async importAssets(file: File): Promise<{ success: number; failed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/assets/assets/import', formData, {
      customHeaders: {
        'Content-Type': undefined as any,
      },
    });
    return response.data;
  }
}

export const assetService = new AssetService();