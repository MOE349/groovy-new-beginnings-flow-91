import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface PartCreateChecklistTabProps {
  partId?: string;
}

const PartCreateChecklistTab: React.FC<PartCreateChecklistTabProps> = ({
  partId,
}) => {
  return (
    <GenericTab
      title="Checklist"
      description="Checklist items and progress will go here"
    >
      <div className="p-3">Content will be available after creation.</div>
    </GenericTab>
  );
};

export default PartCreateChecklistTab;
