import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface PartCreateCompletionTabProps {
  partId?: string;
}

const PartCreateCompletionTab: React.FC<PartCreateCompletionTabProps> = ({
  partId,
}) => {
  return (
    <GenericTab
      title="Completion"
      description="Completion tracking and details will go here"
    >
      <div className="p-3">Content will be available after creation.</div>
    </GenericTab>
  );
};

export default PartCreateCompletionTab;
