import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface PartVendorsTabProps {
  partId: string;
}

const PartVendorsTab: React.FC<PartVendorsTabProps> = ({ partId }) => {
  return (
    <GenericTab
      title="Vendors"
      description="Vendors and supplier relationships will appear here"
    >
      <div className="p-4">Placeholder content.</div>
    </GenericTab>
  );
};

export default PartVendorsTab;
