import { apiClient, PaginatedResponse } from './api.base';

export interface Asset {
  id: string;
  name: string;
  description?: string;
  code: string;
  category: {
    id: string;
    name: string;
  };
  make: string;
  model: string;
  serial_number: string;
  year?: string;
  location: {
    id: string;
    name: string;
  };
  is_online: boolean;
  equipment?: string;
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetDto {
  name: string;
  description?: string;
  code: string;
  category: string;
  make: string;
  model: string;
  serial_number: string;
  year?: string;
  location: string;
  is_online: boolean;
  equipment?: string;
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry_date?: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  slug: string;
}

export interface AssetFilters {
  is_online?: boolean;
  category?: string;
  location?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

class AssetsService {
  /**
   * Get all assets with pagination
   */
  async getAssets(filters?: AssetFilters): Promise<PaginatedResponse<Asset>> {
    const response = await apiClient.get<PaginatedResponse<Asset>>('/assets/assets', {
      params: filters,
    });
    
    return response.data;
  }

  /**
   * Get single asset by ID
   */
  async getAsset(id: string): Promise<Asset> {
    const response = await apiClient.get<Asset>(`/assets/assets/${id}`);
    return response.data;
  }

  /**
   * Create new asset
   */
  async createAsset(data: CreateAssetDto): Promise<Asset> {
    const response = await apiClient.post<Asset>('/assets/assets', data);
    return response.data;
  }

  /**
   * Update asset
   */
  async updateAsset(id: string, data: Partial<CreateAssetDto>): Promise<Asset> {
    const response = await apiClient.patch<Asset>(`/assets/assets/${id}`, data);
    return response.data;
  }

  /**
   * Delete asset
   */
  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete(`/assets/assets/${id}`);
  }

  /**
   * Get equipment categories
   */
  async getEquipmentCategories(): Promise<AssetCategory[]> {
    const response = await apiClient.get<{ data: AssetCategory[] }>('/assets/equipment_category');
    return response.data.data || response.data;
  }

  /**
   * Get attachment categories
   */
  async getAttachmentCategories(): Promise<AssetCategory[]> {
    const response = await apiClient.get<{ data: AssetCategory[] }>('/assets/attachment_category');
    return response.data.data || response.data;
  }

  /**
   * Create equipment category
   */
  async createEquipmentCategory(data: { name: string; slug: string }): Promise<AssetCategory> {
    const response = await apiClient.post<AssetCategory>('/assets/equipment_category', data);
    return response.data;
  }

  /**
   * Create attachment category
   */
  async createAttachmentCategory(data: { name: string; slug: string }): Promise<AssetCategory> {
    const response = await apiClient.post<AssetCategory>('/assets/attachment_category', data);
    return response.data;
  }

  /**
   * Get asset statistics
   */
  async getAssetStats(): Promise<{
    total: number;
    online: number;
    offline: number;
    maintenance: number;
  }> {
    const response = await apiClient.get('/assets/stats');
    return response.data;
  }

  /**
   * Get asset history
   */
  async getAssetHistory(assetId: string): Promise<any[]> {
    const response = await apiClient.get(`/assets/assets/${assetId}/history`);
    return response.data;
  }

  /**
   * Upload asset document
   */
  async uploadAssetDocument(assetId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/assets/assets/${assetId}/documents`, formData, {
      customHeaders: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
}

export const assetsService = new AssetsService();