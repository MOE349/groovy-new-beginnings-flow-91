
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiCall } from "@/utils/apis";
import { AssetType } from "./useAssetData";
import { handleApiError } from "@/utils/errorHandling";

export const useAssetSubmit = (id: string | undefined, assetType: AssetType | null) => {
  const queryClient = useQueryClient();

  const handleSubmit = async (data: Record<string, any>) => {
    if (!assetType || !id) return;
    
    try {
      const endpoint = assetType === "equipment" ? `/assets/equipments/${id}` : `/assets/attachments/${id}`;
      await apiCall(endpoint, { method: 'PATCH', body: data });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["asset", id] });
      queryClient.invalidateQueries({ queryKey: ["asset-movement-log", id] });
      
      toast({
        title: "Success",
        description: `${assetType === "equipment" ? "Equipment" : "Attachment"} updated successfully!`,
      });
    } catch (error: any) {
      handleApiError(error, "Update Failed");
    }
  };

  return { handleSubmit };
};