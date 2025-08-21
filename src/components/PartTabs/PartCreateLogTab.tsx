import React from "react";
import { GenericTab } from "@/components/EntityTabs";

export interface PartCreateLogTabProps {
  partId?: string;
}

const PartCreateLogTab: React.FC<PartCreateLogTabProps> = ({ partId }) => {
  return (
    <GenericTab title="Log" description="Part activity log will go here">
      <div className="p-3">Content will be available after creation.</div>
    </GenericTab>
  );
};

export default PartCreateLogTab;
