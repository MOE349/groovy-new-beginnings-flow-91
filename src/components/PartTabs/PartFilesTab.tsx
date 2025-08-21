import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface PartFilesTabProps {
  partId: string;
}

const PartFilesTab: React.FC<PartFilesTabProps> = ({ partId }) => {
  return (
    <GenericTab
      title="Files"
      description="Attached files and documents will appear here"
    >
      <div className="p-4">Placeholder content.</div>
    </GenericTab>
  );
};

export default PartFilesTab;
