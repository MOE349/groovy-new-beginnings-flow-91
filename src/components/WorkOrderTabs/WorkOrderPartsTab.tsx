import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface WorkOrderPartsTabProps {
  workOrderId: string;
  isReadOnly?: boolean;
}

const WorkOrderPartsTab: React.FC<WorkOrderPartsTabProps> = ({
  workOrderId,
  isReadOnly = false,
}) => {
  return (
    <GenericTab
      title="Parts"
      description="Parts and materials needed will go here"
    >
      {/* Read-only indicator */}
      {isReadOnly && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <div className="text-orange-600 text-sm font-medium">
              🔒 This work order is closed. All data is read-only.
            </div>
          </div>
        </div>
      )}

      <div className="p-4 text-center text-muted-foreground">
        Parts content coming soon...
      </div>
    </GenericTab>
  );
};

export default WorkOrderPartsTab;
