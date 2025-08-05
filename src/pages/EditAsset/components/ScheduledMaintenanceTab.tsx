/**
 * ScheduledMaintenanceTab Component
 * Handles scheduled maintenance views and PM settings
 */

import React from "react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PMChecklistTabs from "@/components/PMChecklistTabs";
import { PMTriggerContainer } from "@/components/PMTriggerContainer";
import { apiCall } from "@/utils/apis";

interface ScheduledMaintenanceTabProps {
  assetId: string;
  activeTab: string;
}

export const ScheduledMaintenanceTab = React.memo<ScheduledMaintenanceTabProps>(({
  assetId,
  activeTab,
}) => {
  const [currentView, setCurrentView] = useState(0);

  const { data: pmSettingsData } = useQuery({
    queryKey: [`/pm-automation/pm-settings?asset=${assetId}`],
    queryFn: async () => {
      const response = await apiCall(`/pm-automation/pm-settings?asset=${assetId}`);
      return response.data.data || response.data;
    },
    enabled: !!assetId,
  });

  useEffect(() => {
    if (activeTab !== "scheduled-maintenance") {
      setCurrentView(0);
    }
  }, [activeTab]);

  const handleViewChange = React.useCallback((viewIndex: number) => {
    setCurrentView(viewIndex);
  }, []);

  const views = [
    {
      title: "PM Settings",
      component: (
        <PMChecklistTabs 
          assetId={assetId} 
          onNavigateBack={() => handleViewChange(0)} 
        />
      ),
    },
    {
      title: "PM Triggers",
      component: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">PM Triggers</h3>
          <p className="text-muted-foreground">PM Trigger functionality will be implemented here.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="tab-content-scheduled-maintenance">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewChange(Math.max(0, currentView - 1))}
            disabled={currentView === 0}
            className="p-1 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium">
            {views[currentView]?.title} ({currentView + 1} of {views.length})
          </span>
          <button
            onClick={() =>
              handleViewChange(Math.min(views.length - 1, currentView + 1))
            }
            disabled={currentView === views.length - 1}
            className="p-1 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1">
        {views[currentView]?.component}
      </div>
    </div>
  );
});

ScheduledMaintenanceTab.displayName = "ScheduledMaintenanceTab";