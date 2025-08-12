import React from "react";
import { FilesTab } from "@/components/EntityTabs";

export interface WorkOrderFilesTabProps {
  workOrderId: string;
}

const WorkOrderFilesTab: React.FC<WorkOrderFilesTabProps> = ({
  workOrderId,
}) => {
  return (
    <FilesTab
      linkToModel="work_orders.workorder"
      linkToId={workOrderId}
      maxSize={25}
    />
  );
};

export default WorkOrderFilesTab;
