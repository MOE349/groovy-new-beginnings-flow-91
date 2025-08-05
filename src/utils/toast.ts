import { toast } from "@/hooks/use-toast";

/**
 * Standardized toast utilities for consistent messaging
 */

export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description:
      description ||
      "Please try again or contact support if the problem persists.",
    variant: "destructive",
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast({
    title,
    description,
  });
};

export const showWarningToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive", // Using destructive for warnings since there's no warning variant
  });
};

/**
 * Common toast messages for standard operations
 */
export const standardToasts = {
  // Success messages
  saved: () =>
    showSuccessToast("Saved", "Changes have been saved successfully"),
  created: (item: string = "Item") =>
    showSuccessToast("Created", `${item} has been created successfully`),
  updated: (item: string = "Item") =>
    showSuccessToast("Updated", `${item} has been updated successfully`),
  deleted: (item: string = "Item") =>
    showSuccessToast("Deleted", `${item} has been deleted successfully`),
  uploaded: () =>
    showSuccessToast("Uploaded", "File has been uploaded successfully"),

  // Error messages
  saveFailed: () => showErrorToast("Save Failed", "Unable to save changes"),
  createFailed: (item: string = "item") =>
    showErrorToast("Create Failed", `Unable to create ${item}`),
  updateFailed: (item: string = "item") =>
    showErrorToast("Update Failed", `Unable to update ${item}`),
  deleteFailed: (item: string = "item") =>
    showErrorToast("Delete Failed", `Unable to delete ${item}`),
  uploadFailed: () => showErrorToast("Upload Failed", "Unable to upload file"),
  loadFailed: () => showErrorToast("Load Failed", "Unable to load data"),

  // Info messages
  loading: () => showInfoToast("Loading", "Please wait..."),
  processing: () =>
    showInfoToast("Processing", "Your request is being processed"),
};
