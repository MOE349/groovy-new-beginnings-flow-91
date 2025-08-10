import React from "react";
import { TableTab } from "@/components/EntityTabs";

export interface AssetBacklogTabProps {
  assetId: string;
}

const AssetBacklogTab: React.FC<AssetBacklogTabProps> = ({ assetId }) => {
  return (
    <TableTab
      endpoint={`/asset-backlogs/asset_backlog?asset=${assetId}`}
      columns={[{ key: "name", header: "Name" }]}
      queryKey={["asset-backlogs", assetId]}
      emptyMessage="No backlog items found"
      canAdd={true}
      addButtonText="Add Backlog Item"
      addFields={[
        {
          name: "asset",
          label: "Asset",
          type: "input",
          inputType: "hidden",
        },
        {
          name: "name",
          label: "Name",
          type: "input",
          inputType: "text",
          required: true,
        },
      ]}
      addEndpoint="/asset-backlogs/asset_backlog"
      addInitialData={{
        asset: assetId,
        name: "",
      }}
    />
  );
};

export default AssetBacklogTab;
