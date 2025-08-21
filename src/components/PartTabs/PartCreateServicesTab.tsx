import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface PartCreateServicesTabProps {
  partId?: string;
}

const PartCreateServicesTab: React.FC<PartCreateServicesTabProps> = ({
  partId,
}) => {
  return (
    <GenericTab
      title="Third-party services"
      description="Third-party services and contractors will go here"
    >
      <div className="p-3">Content will be available after creation.</div>
    </GenericTab>
  );
};

export default PartCreateServicesTab;
