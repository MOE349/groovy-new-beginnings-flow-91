import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface PartCreateFilesTabProps {
  partId?: string;
}

const PartCreateFilesTab: React.FC<PartCreateFilesTabProps> = ({ partId }) => {
  return (
    <GenericTab
      title="Files"
      description="Attached files and documents will go here"
    >
      <div className="p-3">Content will be available after creation.</div>
    </GenericTab>
  );
};

export default PartCreateFilesTab;
