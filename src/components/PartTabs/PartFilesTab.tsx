import React from "react";
import { FilesTab } from "@/components/EntityTabs";

export interface PartFilesTabProps {
  partId: string;
}

const PartFilesTab: React.FC<PartFilesTabProps> = ({ partId }) => {
  return <FilesTab linkToModel="parts.part" linkToId={partId} maxSize={25} />;
};

export default PartFilesTab;
