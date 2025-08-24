/**
 * useFileOperations Hook
 * Custom hook for file CRUD operations using async operation patterns
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { fileService } from "@/services/api/fileService";
import type { FileUpdateData } from "../types";

export const useFileOperations = (linkToModel: string, linkToId: string) => {
  const queryClient = useQueryClient();

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: fileService.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["files", linkToModel, linkToId],
      });
      toast({
        title: "File Deleted",
        description: "File has been successfully deleted",
      });
    },
    onError: (error) => {
      handleApiError(error, "Failed to delete file");
    },
  });

  // Update file mutation
  const updateFileMutation = useMutation({
    mutationFn: async (data: FileUpdateData) => {
      // Update file metadata using FormData
      const formData = new FormData();
      formData.append("description", data.description);
      formData.append("tags", data.tags);

      await fileService.updateFile(data.fileId, formData);

      // Set as default image if requested and file is an image
      if (data.setAsDefaultImage && data.isImage) {
        await fileService.setAsDefaultImage(linkToModel, linkToId, data.fileId);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["files", linkToModel, linkToId],
      });
      const successMessage =
        data.setAsDefaultImage && data.isImage
          ? "File updated and set as default image"
          : "File metadata updated successfully";

      toast({
        title: "File Updated",
        description: successMessage,
      });
    },
    onError: (error) => {
      handleApiError(error, "Failed to update file");
    },
  });

  // Download file function
  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      const blob = await fileService.downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      handleApiError(error, "Failed to download file");
    }
  };

  return {
    deleteFile: deleteFileMutation.mutate,
    updateFile: updateFileMutation.mutate,
    downloadFile,
    isDeleting: deleteFileMutation.isPending,
    isUpdating: updateFileMutation.isPending,
  };
};
