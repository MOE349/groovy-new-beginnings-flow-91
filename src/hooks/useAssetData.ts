import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";

export type AssetType = "equipment" | "attachment";

interface UseAssetDataResult {
  assetType: AssetType | null;
  assetData: any;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useAssetData = (id: string | undefined): UseAssetDataResult => {
  const [assetType, setAssetType] = useState<AssetType | null>(null);

  // Try to fetch from equipment endpoint
  const {
    data: equipmentData,
    isLoading: isLoadingEquipment,
    error: equipmentError,
  } = useQuery({
    queryKey: ["equipment", id],
    queryFn: async () => {
      const response = await apiCall(`/assets/equipments/${id}`);
      return response.data.data || response.data;
    },
    enabled: !!id,
    retry: false,
  });

  // Try to fetch from attachment endpoint
  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useQuery({
    queryKey: ["attachment", id],
    queryFn: async () => {
      const response = await apiCall(`/assets/attachments/${id}`);
      return response.data.data || response.data;
    },
    enabled: !!id,
    retry: false,
  });

  // Determine asset type based on successful query
  useEffect(() => {
    if (equipmentData && !equipmentError) {
      setAssetType("equipment");
    } else if (attachmentData && !attachmentError) {
      setAssetType("attachment");
    }
  }, [equipmentData, attachmentData, equipmentError, attachmentError]);

  const assetData = assetType === "equipment" ? equipmentData : attachmentData;
  const isLoading = isLoadingEquipment || isLoadingAttachment;
  const isError = Boolean(equipmentError && attachmentError);
  const error = equipmentError || attachmentError;

  return {
    assetType,
    assetData,
    isLoading,
    isError,
    error,
  };
};