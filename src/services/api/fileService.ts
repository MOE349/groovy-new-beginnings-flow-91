/**
 * File Service
 * Centralized API operations for file management
 */

import { apiCall } from "@/utils/apis";
import type { FileItem } from "@/components/FilesManager/types";

export const fileService = {
  /**
   * Get files for a specific model and ID
   */
  getFiles: async (
    linkToModel: string,
    linkToId: string
  ): Promise<FileItem[]> => {
    const response = await apiCall(
      `/file-uploads/files/?link_to_model=${linkToModel}&object_id=${linkToId}`
    );
    return response.data.data as FileItem[];
  },

  /**
   * Upload a new file
   */
  uploadFile: async (formData: FormData): Promise<{ id: string }> => {
    const token = localStorage.getItem("access_token");
    const apiUrl = "https://tenmil.api.alfrih.com/v1/api/file-uploads/files/";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { id: result.data?.id || result.id };
  },

  /**
   * Update file metadata
   */
  updateFile: async (fileId: string, formData: FormData): Promise<void> => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `https://tenmil.api.alfrih.com/v1/api/file-uploads/files/${fileId}/`,
      {
        method: "PATCH",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  /**
   * Delete a file
   */
  deleteFile: async (fileId: string): Promise<void> => {
    await apiCall(`/file-uploads/files/${fileId}/`, { method: "DELETE" });
  },

  /**
   * Download a file
   */
  downloadFile: async (fileId: string): Promise<Blob> => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `https://tenmil.api.alfrih.com/v1/api/file-uploads/files/${fileId}/download/`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  },

  /**
   * Set file as default image for an asset
   */
  setAsDefaultImage: async (
    linkToModel: string,
    linkToId: string,
    fileId: string
  ): Promise<void> => {
    const assetType = linkToModel.includes("equipment")
      ? "equipments"
      : "attachments";

    await apiCall(`/assets/${assetType}/${linkToId}/set-image/`, {
      method: "POST",
      body: { file_id: fileId },
    });
  },
};
