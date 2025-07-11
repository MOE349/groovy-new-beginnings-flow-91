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

  // Fetch from unified assets endpoint
  const {
    data: assetData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["asset", id],
    queryFn: async () => {
      const response = await apiCall(`/assets/assets/${id}`);
      return response.data.data || response.data;
    },
    enabled: !!id,
    retry: false,
  });

  // Determine asset type based on asset data
  useEffect(() => {
    if (assetData && !error) {
      // Determine type based on asset data structure or type field
      // You may need to adjust this logic based on how the API returns the type
      setAssetType(assetData.type || "equipment");
    }
  }, [assetData, error]);

  const isError = Boolean(error);

  return {
    assetType,
    assetData,
    isLoading,
    isError,
    error,
  };
};