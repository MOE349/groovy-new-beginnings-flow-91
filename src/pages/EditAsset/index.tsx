/**
 * EditAsset Main Component
 * Refactored for better performance and maintainability
 */

import React from "react";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useAssetData } from "@/hooks/useAssetData";
import { useAssetSubmit } from "@/hooks/useAssetSubmit";
import GearSpinner from "@/components/ui/gear-spinner";
import { EditAssetForm } from "./components/EditAssetForm";
import { EditAssetTabs } from "./components/EditAssetTabs";
import { usePrefetchFinancialData } from "@/hooks/useFinancialDataOptimized";

const EditAsset = React.memo(() => {
  const { id } = useParams();
  const prefetchFinancialData = usePrefetchFinancialData();

  const { assetType, assetData, isLoading, isError, error } = useAssetData(id);
  const { handleSubmit } = useAssetSubmit(id, assetType);

  // Prefetch financial data when component mounts
  React.useEffect(() => {
    if (id) {
      prefetchFinancialData(id);
    }
  }, [id, prefetchFinancialData]);

  const handleFinancialsTabHover = React.useCallback(() => {
    if (id) {
      prefetchFinancialData(id);
    }
  }, [id, prefetchFinancialData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load asset data: {error?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!assetType || !assetData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto min-w-0 flex flex-col">
      <div className="space-y-4 min-w-[1440px] flex-1 flex flex-col">
        <EditAssetForm
          assetType={assetType}
          assetData={assetData}
          onSubmit={handleSubmit}
        />
        
        <EditAssetTabs
          assetId={id || ""}
          onFinancialsTabHover={handleFinancialsTabHover}
        />
      </div>
    </div>
  );
});

EditAsset.displayName = "EditAsset";

export default EditAsset;