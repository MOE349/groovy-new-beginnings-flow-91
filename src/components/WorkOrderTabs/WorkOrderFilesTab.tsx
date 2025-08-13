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
    <div>
      {/* Read-only indicator */}
      {isReadOnly && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4 mx-4 mt-4">
          <div className="flex items-center">
            <div className="text-orange-600 text-sm font-medium">
              🔒 This work order is closed. All data is read-only.
            </div>
          </div>
        </div>
      )}

      <FilesTab
        linkToModel="work_orders.workorder"
        linkToId={workOrderId}
        maxSize={25}
      />
    </div>
  );
};

export default WorkOrderFilesTab;
