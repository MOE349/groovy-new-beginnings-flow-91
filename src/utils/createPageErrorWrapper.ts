import { apiCall } from "@/utils/apis";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";

/**
 * Utility wrapper for create page form submissions
 */
export const createPageSubmitWrapper = (endpoint: string, successMessage: string) => {
  return async (data: Record<string, any>) => {
    try {
      await apiCall(endpoint, { method: 'POST', body: data });
      toast({
        title: "Success",
        description: successMessage,
      });
    } catch (error: any) {
      handleApiError(error, "Creation Failed");
    }
  };
};

/**
 * Utility wrapper for edit page form submissions
 */
export const editPageSubmitWrapper = (endpoint: string, successMessage: string) => {
  return async (data: Record<string, any>) => {
    try {
      await apiCall(endpoint, { method: 'PATCH', body: data });
      toast({
        title: "Success",
        description: successMessage,
      });
    } catch (error: any) {
      handleApiError(error, "Update Failed");
    }
  };
};