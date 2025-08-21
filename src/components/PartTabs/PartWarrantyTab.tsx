import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface PartWarrantyTabProps {
  partId: string;
}

const PartWarrantyTab: React.FC<PartWarrantyTabProps> = ({ partId }) => {
  return (
    <GenericTab
      title="Warranty"
      description="Warranty details and terms will appear here"
    >
      <div className="p-4">Placeholder content.</div>
    </GenericTab>
  );
};

export default PartWarrantyTab;
