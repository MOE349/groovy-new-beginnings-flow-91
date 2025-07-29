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
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isCodeDialogOpen: boolean;
  setIsCodeDialogOpen: (open: boolean) => void;
  isBacklogDialogOpen: boolean;
  setIsBacklogDialogOpen: (open: boolean) => void;
  currentView: number;
  setCurrentView: (view: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMeterTriggerActive: boolean;
  setIsMeterTriggerActive: (active: boolean) => void;
  isTimeTriggerActive: boolean;
  setIsTimeTriggerActive: (active: boolean) => void;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  selectedRadioId: string | null;
  setSelectedRadioId: (id: string | null) => void;
  isFieldsEditable: boolean;
  setIsFieldsEditable: (editable: boolean) => void;
  meterTriggerData: any;
  setMeterTriggerData: (data: any) => void;
  calendarTriggerData: any;
  setCalendarTriggerData: (data: any) => void;
  pmSettingsData: any;
  handleDeleteMeterReading: (id: string) => void;
  handleDeleteCode: (id: string) => void;
  handleSaveCalendarTrigger: () => void;
  handleFinancialsTabHover: () => void;
}

const AssetTabsContainer = ({ 
  assetId,
  isDialogOpen,
  setIsDialogOpen,
  isCodeDialogOpen,
  setIsCodeDialogOpen,
  isBacklogDialogOpen,
  setIsBacklogDialogOpen,
  currentView,
  setCurrentView,
  activeTab,
  setActiveTab,
  isMeterTriggerActive,
  setIsMeterTriggerActive,
  isTimeTriggerActive,
  setIsTimeTriggerActive,
  isEditMode,
  setIsEditMode,
  selectedItemId,
  setSelectedItemId,
  selectedRadioId,
  setSelectedRadioId,
  isFieldsEditable,
  setIsFieldsEditable,
  meterTriggerData,
  setMeterTriggerData,
  calendarTriggerData,
  setCalendarTriggerData,
  pmSettingsData,
  handleDeleteMeterReading,
  handleDeleteCode,
  handleSaveCalendarTrigger,
  handleFinancialsTabHover
}: AssetTabsContainerProps) => {
  const prefetchFinancialData = usePrefetchFinancialData();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value !== "scheduled-maintenance") {
      setCurrentView(0);
    }
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
          <MeterEventsTab 
            assetId={assetId}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            isCodeDialogOpen={isCodeDialogOpen}
            setIsCodeDialogOpen={setIsCodeDialogOpen}
            handleDeleteMeterReading={handleDeleteMeterReading}
            handleDeleteCode={handleDeleteCode}
          />
        </TabsContent>

        <TabsContent value="scheduled-maintenance" className="tab-content-container">
          <ScheduledMaintenanceTab 
            assetId={assetId} 
            currentView={currentView} 
            onViewChange={setCurrentView}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            selectedRadioId={selectedRadioId}
            setSelectedRadioId={setSelectedRadioId}
            isFieldsEditable={isFieldsEditable}
            setIsFieldsEditable={setIsFieldsEditable}
            meterTriggerData={meterTriggerData}
            setMeterTriggerData={setMeterTriggerData}
            calendarTriggerData={calendarTriggerData}
            setCalendarTriggerData={setCalendarTriggerData}
            pmSettingsData={pmSettingsData}
            handleSaveCalendarTrigger={handleSaveCalendarTrigger}
          />
        </TabsContent>

        <TabsContent value="financials" className="tab-content-container">
          <FinancialsTabContent assetId={assetId} />
        </TabsContent>

        <TabsContent value="backlog" className="tab-content-container">
          <BacklogTab 
            assetId={assetId}
            isBacklogDialogOpen={isBacklogDialogOpen}
            setIsBacklogDialogOpen={setIsBacklogDialogOpen}
          />
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