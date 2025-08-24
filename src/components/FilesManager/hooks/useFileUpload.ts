/**
 * useFileUpload Hook
 * Custom hook for managing file upload operations and state
 */

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { fileService } from "@/services/api/fileService";
import type { UploadedFile, FileUploadData } from "../types";

export const useFileUpload = (linkToModel: string, linkToId: string) => {
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = async (
    files: File[],
    uploadData: FileUploadData,
    maxSize: number
  ) => {
    if (files.length === 0) return;

    // Validate file sizes
    const oversizedFiles = files.filter(
      (file) => file.size > maxSize * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Size Error",
        description: `Some files exceed the ${maxSize}MB limit`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Initialize file states
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: "",
      name: file.name,
      size: file.size,
      status: "uploading",
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("link_to_model", linkToModel);
        formData.append("link_to_id", linkToId);
        if (uploadData.description)
          formData.append("description", uploadData.description);
        if (uploadData.tags) formData.append("tags", uploadData.tags);

        try {
          // Update progress
          setUploadedFiles((prev) =>
            prev.map((f, index) =>
              index === prev.length - files.length + i
                ? { ...f, progress: 50 }
                : f
            )
          );

          const result = await fileService.uploadFile(formData);
          const fileId = result.id;

          if (fileId) {
            // Update file status to completed
            setUploadedFiles((prev) =>
              prev.map((f, index) =>
                index === prev.length - files.length + i
                  ? { ...f, id: fileId, status: "completed", progress: 100 }
                  : f
              )
            );

            // Set as default image if toggle is checked and file is an image
            if (
              uploadData.setAsDefaultImage &&
              file.type.startsWith("image/")
            ) {
              try {
                await fileService.setAsDefaultImage(
                  linkToModel,
                  linkToId,
                  fileId
                );
                toast({
                  title: "Default Image Set",
                  description:
                    "Image has been set as the default for this asset",
                });
              } catch (imageError) {
                handleApiError(imageError, "Failed to set default image");
              }
            }
          } else {
            throw new Error("No file ID returned from server");
          }
        } catch (error) {
          // Update file status to error
          setUploadedFiles((prev) =>
            prev.map((f, index) =>
              index === prev.length - files.length + i
                ? { ...f, status: "error", progress: 0 }
                : f
            )
          );
          handleApiError(error, `Upload failed for ${file.name}`);
        }
      }

      // Refresh the files list
      queryClient.invalidateQueries({
        queryKey: ["files", linkToModel, linkToId],
      });

      toast({
        title: "Upload Successful",
        description: `${files.length} file(s) uploaded successfully`,
      });

      return true; // Success indicator
    } catch (error) {
      handleApiError(error, "Upload failed");
      return false;
    } finally {
      setIsUploading(false);
      setUploadedFiles([]);
    }
  };

  const resetUpload = () => {
    setUploadedFiles([]);
    setIsUploading(false);
  };

  return {
    uploadFiles,
    resetUpload,
    uploadedFiles,
    isUploading,
  };
};
