import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface WorkOrderFilesTabProps {
  workOrderId: string;
}

const WorkOrderFilesTab: React.FC<WorkOrderFilesTabProps> = ({
  workOrderId,
}) => {
  return (
    <GenericTab
      title="Files"
      description="Attached files and documents will go here"
    >
      <div className="p-4 text-center text-muted-foreground">
        Files content coming soon...
      </div>
    </GenericTab>
  );
};

export default WorkOrderFilesTab;
