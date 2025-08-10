import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface WorkOrderPartsTabProps {
  workOrderId: string;
}

const WorkOrderPartsTab: React.FC<WorkOrderPartsTabProps> = ({
  workOrderId,
}) => {
  return (
    <GenericTab
      title="Parts"
      description="Parts and materials needed will go here"
    >
      <div className="p-4 text-center text-muted-foreground">
        Parts content coming soon...
      </div>
    </GenericTab>
  );
};

export default WorkOrderPartsTab;
