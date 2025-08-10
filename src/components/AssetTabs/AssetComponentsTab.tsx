import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface AssetComponentsTabProps {
  assetId: string;
}

const AssetComponentsTab: React.FC<AssetComponentsTabProps> = ({ assetId }) => {
  return (
    <GenericTab
      title="Components"
      description="Components content coming soon..."
    >
      <div className="p-4 text-center text-muted-foreground">
        Components content coming soon...
      </div>
    </GenericTab>
  );
};

export default AssetComponentsTab;
