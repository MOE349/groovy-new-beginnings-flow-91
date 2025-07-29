import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialsTabContent from "@/components/FinancialsTabContent";
import PartsBomTabContent from "@/components/PartsBomTabContent";
import MeterEventsTab from "@/components/MeterEventsTab";
import ScheduledMaintenanceTab from "@/components/ScheduledMaintenanceTab";
import BacklogTab from "@/components/BacklogTab";
import FilesTab from "@/components/FilesTab";
import ComponentsTab from "@/components/ComponentsTab";
import LogTab from "@/components/LogTab";
import { usePrefetchFinancialData } from "@/hooks/useFinancialDataOptimized";

interface AssetTabsContainerProps {
  assetId: string;
}

const AssetTabsContainer = ({ assetId }: AssetTabsContainerProps) => {
  const [activeTab, setActiveTab] = useState("");
  const [currentView, setCurrentView] = useState(0);
  const prefetchFinancialData = usePrefetchFinancialData();

  const handleFinancialsTabHover = () => {
    prefetchFinancialData(assetId);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value !== "scheduled-maintenance") {
      setCurrentView(0);
    }
  };

  const handleViewChange = (viewIndex: number) => {
    setCurrentView(viewIndex);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Tabs defaultValue="metering-events" className="flex-1 flex flex-col" onValueChange={handleTabChange}>
        <div className="h-10 overflow-x-auto flex-shrink-0">
          <TabsList className="grid w-full grid-cols-8 h-10 bg-card border border-border rounded-md p-0">
            <TabsTrigger value="metering-events" className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none">
              Metering/Events
            </TabsTrigger>
            <TabsTrigger value="scheduled-maintenance" className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none">
              Scheduled Maintenance
            </TabsTrigger>
            <TabsTrigger value="parts-bom" className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none">
              Parts/BOM
            </TabsTrigger>
            <TabsTrigger value="backlog" className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none">
              Backlog
            </TabsTrigger>
            <TabsTrigger 
              value="financials" 
              className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              onMouseEnter={handleFinancialsTabHover}
            >
              Financials
            </TabsTrigger>
            <TabsTrigger value="files" className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none">
              Files
            </TabsTrigger>
            <TabsTrigger value="components" className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none">
              Components
            </TabsTrigger>
            <TabsTrigger value="log" className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none">
              Log
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="parts-bom" className="tab-content-container">
          <PartsBomTabContent assetId={assetId} />
        </TabsContent>
        
        <TabsContent value="metering-events" className="tab-content-container">
          <MeterEventsTab assetId={assetId} />
        </TabsContent>

        <TabsContent value="scheduled-maintenance" className="tab-content-container">
          <ScheduledMaintenanceTab 
            assetId={assetId} 
            currentView={currentView} 
            onViewChange={handleViewChange} 
          />
        </TabsContent>

        <TabsContent value="financials" className="tab-content-container">
          <FinancialsTabContent assetId={assetId} />
        </TabsContent>

        <TabsContent value="backlog" className="tab-content-container">
          <BacklogTab assetId={assetId} />
        </TabsContent>

        <TabsContent value="files" className="tab-content-container">
          <FilesTab />
        </TabsContent>
        
        <TabsContent value="components" className="tab-content-container">
          <ComponentsTab />
        </TabsContent>
        
        <TabsContent value="log" className="tab-content-container">
          <LogTab assetId={assetId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetTabsContainer;