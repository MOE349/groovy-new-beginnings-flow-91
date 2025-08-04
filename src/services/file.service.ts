import { apiClient } from './api.base';
import { API_CONFIG } from '@/config/api';
import { mockApiClient } from './api.mock';

interface FileUploadResponse {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  url: string;
  thumbnail_url?: string;
  uploaded_at: string;
}

interface FileMetadata {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  url: string;
  thumbnail_url?: string;
  uploaded_by: {
    id: string;
    name: string;
  };
  uploaded_at: string;
  entity_type?: string;
  entity_id?: string;
  category?: string;
  description?: string;
  tags?: string[];
  is_public: boolean;
}

interface FileUploadOptions {
  entity_type?: string;
  entity_id?: string;
  category?: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
  generate_thumbnail?: boolean;
}

class FileService {
  private get client() {
    return API_CONFIG.ENABLE_MOCK_DATA ? mockApiClient : apiClient;
  }

  /**
   * Upload single file
   */
  async uploadFile(file: File, options?: FileUploadOptions): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add options to form data
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
    }

    const response = await this.client.post<FileUploadResponse>('/files/upload', formData, {
      customHeaders: {
        'Content-Type': undefined as any, // Let browser set multipart/form-data
      },
    });
    return response.data;
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: File[], options?: FileUploadOptions): Promise<FileUploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add options to form data
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
    }

    const response = await this.client.post<FileUploadResponse[]>('/files/upload-multiple', formData, {
      customHeaders: {
        'Content-Type': undefined as any,
      },
    });
    return response.data;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    const response = await this.client.get<FileMetadata>(`/files/${fileId}`);
    return response.data;
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(fileId: string, data: {
    filename?: string;
    description?: string;
    category?: string;
    tags?: string[];
    is_public?: boolean;
  }): Promise<FileMetadata> {
    const response = await this.client.patch<FileMetadata>(`/files/${fileId}`, data);
    return response.data;
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.client.delete(`/files/${fileId}`);
  }

  /**
   * Get files by entity
   */
  async getFilesByEntity(entityType: string, entityId: string, category?: string): Promise<FileMetadata[]> {
    const response = await this.client.get<FileMetadata[]>('/files', {
      params: {
        entity_type: entityType,
        entity_id: entityId,
        category,
      },
    });
    return response.data;
  }

  /**
   * Download file
   */
  async downloadFile(fileId: string): Promise<Blob> {
    const response = await this.client.get<Blob>(`/files/${fileId}/download`, {
      customHeaders: {
        'Accept': 'application/octet-stream',
      },
    });
    return response.data;
  }

  /**
   * Get file download URL
   */
  async getFileDownloadUrl(fileId: string): Promise<{ url: string; expires_at: string }> {
    const response = await this.client.get<{ url: string; expires_at: string }>(`/files/${fileId}/download-url`);
    return response.data;
  }

  /**
   * Create file share link
   */
  async createShareLink(fileId: string, options?: {
    expires_in_hours?: number;
    password?: string;
    max_downloads?: number;
  }): Promise<{
    share_id: string;
    share_url: string;
    expires_at?: string;
  }> {
    const response = await this.client.post(`/files/${fileId}/share`, options);
    return response.data;
  }

  /**
   * Revoke share link
   */
  async revokeShareLink(fileId: string, shareId: string): Promise<void> {
    await this.client.delete(`/files/${fileId}/share/${shareId}`);
  }

  /**
   * Upload from URL
   */
  async uploadFromUrl(url: string, options?: FileUploadOptions): Promise<FileUploadResponse> {
    const response = await this.client.post<FileUploadResponse>('/files/upload-from-url', {
      url,
      ...options,
    });
    return response.data;
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<{
    used_bytes: number;
    total_bytes: number;
    usage_percentage: number;
    by_category: Record<string, number>;
    by_type: Record<string, number>;
  }> {
    const response = await this.client.get('/files/storage-usage');
    return response.data;
  }

  /**
   * Bulk delete files
   */
  async bulkDeleteFiles(fileIds: string[]): Promise<void> {
    await this.client.post('/files/bulk-delete', {
      file_ids: fileIds,
    });
  }

  /**
   * Generate image thumbnail
   */
  async generateThumbnail(fileId: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }): Promise<{ thumbnail_url: string }> {
    const response = await this.client.post(`/files/${fileId}/generate-thumbnail`, options);
    return response.data;
  }

  /**
   * Convert document to PDF
   */
  async convertToPdf(fileId: string): Promise<FileUploadResponse> {
    const response = await this.client.post<FileUploadResponse>(`/files/${fileId}/convert-to-pdf`);
    return response.data;
  }

  /**
   * Extract text from document
   */
  async extractText(fileId: string): Promise<{ text: string; metadata?: any }> {
    const response = await this.client.post(`/files/${fileId}/extract-text`);
    return response.data;
  }

  /**
   * Scan file for viruses
   */
  async scanFile(fileId: string): Promise<{
    is_safe: boolean;
    scan_results?: any;
    scanned_at: string;
  }> {
    const response = await this.client.post(`/files/${fileId}/scan`);
    return response.data;
  }
}

export const fileService = new FileService();