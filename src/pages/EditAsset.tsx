import React from "react";
import { useParams } from "react-router-dom";
import { EditEntityTemplate } from "@/templates/EditEntityTemplate";
import { equipmentEditConfig } from "@/configs/entities/equipmentConfig";
import { attachmentEditConfig } from "@/configs/entities/attachmentConfig";
import { useAssetData } from "@/hooks/useAssetData";
import GearSpinner from "@/components/ui/gear-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const EditAsset = () => {
  const { id } = useParams();

  // Get the asset type to determine which config to use
  const { assetType, isLoading, isError, error } = useAssetData(id);

  // Loading state while determining asset type
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  // Error state
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

  // No asset type determined yet
  if (!assetType) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  // Choose the appropriate configuration based on asset type
  const config = assetType === "equipment" ? equipmentEditConfig : attachmentEditConfig;

  // Use the unified template with the selected configuration
  return <EditEntityTemplate config={config} />;
};

export default EditAsset;
