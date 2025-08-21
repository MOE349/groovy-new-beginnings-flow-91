import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface PartCreatePartsTabProps {
  partId?: string;
}

const PartCreatePartsTab: React.FC<PartCreatePartsTabProps> = ({ partId }) => {
  return (
    <GenericTab
      title="Parts"
      description="Parts and materials needed will go here"
    >
      <div className="p-3">Content will be available after creation.</div>
    </GenericTab>
  );
};

export default PartCreatePartsTab;
