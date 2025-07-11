import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiPut } from "@/utils/apis";
import { AssetType } from "./useAssetData";

export const useAssetSubmit = (id: string | undefined, assetType: AssetType | null) => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    if (!assetType || !id) return;
    
    try {
      const endpoint = assetType === "equipment" ? `/assets/equipments/${id}` : `/assets/attachments/${id}`;
      await apiPut(endpoint, data);
      toast({
        title: "Success",
        description: `${assetType === "equipment" ? "Equipment" : "Attachment"} updated successfully!`,
      });
      navigate("/assets");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to update ${assetType}`,
        variant: "destructive",
      });
    }
  };

  return { handleSubmit };
};