/**
 * PendingFileService
 * Service for handling temporary file uploads after entity creation
 */

import { apiCall } from "@/utils/apis";
import { PendingFile } from "@/components/ApiForm/fields";

export interface FileUploadResult {
  success: boolean;
  fileId?: string;
  error?: string;
  fileName: string;
}

export class PendingFileService {
  /**
   * Upload pending files to a specific entity after creation
   */
  static async uploadPendingFiles(
    pendingFiles: PendingFile[],
    linkToModel: string,
    linkToId: string
  ): Promise<FileUploadResult[]> {
    if (!pendingFiles.length) {
      return [];
    }

    const results: FileUploadResult[] = [];

    for (const pendingFile of pendingFiles) {
      try {
        const formData = new FormData();
        formData.append("file", pendingFile.file);
        formData.append("link_to_model", linkToModel);
        formData.append("link_to_id", linkToId);

        if (pendingFile.description) {
          formData.append("description", pendingFile.description);
        }

        if (pendingFile.tags) {
          formData.append("tags", pendingFile.tags);
        }

        // Now we can use apiCall with FormData - the client has been updated to handle it
        const response = await apiCall("/file-uploads/files/", {
          method: "POST",
          body: formData,
        });

        results.push({
          success: true,
          fileId: response.data?.data?.id || response.data?.id || response.id,
          fileName: pendingFile.file.name,
        });
      } catch (error) {
        console.error(`Failed to upload file ${pendingFile.file.name}:`, error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
          fileName: pendingFile.file.name,
        });
      }
    }

    return results;
  }

  /**
   * Process form data to extract and upload pending files
   */
  static async processFormFiles(
    formData: Record<string, any>,
    entityId: string,
    linkToModel: string
  ): Promise<{
    cleanedData: Record<string, any>;
    uploadResults: FileUploadResult[];
  }> {
    const cleanedData = { ...formData };
    let uploadResults: FileUploadResult[] = [];

    // Find and process file fields
    for (const [fieldName, fieldValue] of Object.entries(formData)) {
      if (Array.isArray(fieldValue) && fieldValue.length > 0) {
        // Check if this is a pending files array
        const firstItem = fieldValue[0];
        if (firstItem && typeof firstItem === "object" && "file" in firstItem) {
          const pendingFiles = fieldValue as PendingFile[];

          // Upload the pending files
          const results = await this.uploadPendingFiles(
            pendingFiles,
            linkToModel,
            entityId
          );

          uploadResults = [...uploadResults, ...results];

          // Remove the pending files from the cleaned data
          delete cleanedData[fieldName];
        }
      }
    }

    return { cleanedData, uploadResults };
  }
}
