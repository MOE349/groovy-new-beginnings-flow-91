import React from "react";
import { FilesTab } from "@/components/EntityTabs";

export interface WorkOrderFilesTabProps {
  workOrderId: string;
  isReadOnly?: boolean;
}

const WorkOrderFilesTab: React.FC<WorkOrderFilesTabProps> = ({
  workOrderId,
  isReadOnly = false,
}) => {
  return (
    <>


      <FilesTab
        linkToModel="work_orders.workorder"
        linkToId={workOrderId}
        maxSize={25}
        isReadOnly={isReadOnly}
      />
    </>
  );
};

export default WorkOrderFilesTab;
