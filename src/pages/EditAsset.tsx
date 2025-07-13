import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import ApiTable from "@/components/ApiTable";
import { apiCall } from "@/utils/apis";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle, Trash2, Plus, Check, X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssetData } from "@/hooks/useAssetData";
import { useAssetSubmit } from "@/hooks/useAssetSubmit";
import { equipmentFields, attachmentFields } from "@/data/assetFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import FormLayout from "@/components/FormLayout";
import { equipmentFormConfig, attachmentFormConfig } from "@/config/formLayouts";
import FinancialsTabContent from "@/components/FinancialsTabContent";
import PartsBomTabContent from "@/components/PartsBomTabContent";
import PMChecklistTabs from "@/components/PMChecklistTabs";
import ApiSwitch from "@/components/ApiSwitch";
import ApiDatePicker from "@/components/ApiDatePicker";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EditAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState(0); // 0 for View 1, 1 for View 2
  const [activeTab, setActiveTab] = useState("");
  const [isMeterTriggerActive, setIsMeterTriggerActive] = useState(true);
  const [isTimeTriggerActive, setIsTimeTriggerActive] = useState(true);
  
  // Meter Reading Trigger form state
  const [meterTriggerData, setMeterTriggerData] = useState({
    interval_value: 500,
    interval_unit: "Hour",
    start_threshold_value: 250,
    lead_time_value: 50,
    is_active: true
  });
  const { assetType, assetData, isLoading, isError, error } = useAssetData(id);
  const { handleSubmit } = useAssetSubmit(id, assetType);

  // Reset to View 1 when switching away from scheduled-maintenance tab
  useEffect(() => {
    if (activeTab !== "scheduled-maintenance") {
      setCurrentView(0);
    }
  }, [activeTab]);

  const handleViewChange = (viewIndex: number) => {
    setCurrentView(viewIndex);
  };

  const handleDeleteMeterReading = async (readingId: string) => {
    try {
      await apiCall(`/meter-readings/meter_reading/${readingId}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: [`/meter-readings/meter_reading?asset=${id}`] });
      queryClient.invalidateQueries({ queryKey: ["meter_readings", id] });
      toast({
        title: "Success",
        description: "Meter reading deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete meter reading",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      await apiCall(`/fault-codes/codes/${codeId}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: [`/fault-codes/codes?asset=${id}`] });
      queryClient.invalidateQueries({ queryKey: ["codes", id] });
      toast({
        title: "Success",
        description: "Code deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete code",
        variant: "destructive",
      });
    }
  };

  const handleSaveMeterTrigger = async () => {
    try {
      const submissionData = {
        interval_value: meterTriggerData.interval_value,
        interval_unit: meterTriggerData.interval_unit,
        start_threshold_value: meterTriggerData.start_threshold_value,
        start_threshold_unit: meterTriggerData.interval_unit, // same as interval_unit
        lead_time_value: meterTriggerData.lead_time_value,
        lead_time_unit: meterTriggerData.interval_unit, // same as interval_unit
        is_active: meterTriggerData.is_active,
        asset: id
      };
      
      await apiCall('/pm_automation/pm-settings/', { 
        method: 'POST', 
        body: submissionData 
      });
      
      toast({
        title: "Success",
        description: "PM Trigger settings saved successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save PM Trigger settings",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load asset data: {error?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!assetType || !assetData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  const currentFields = assetType === "equipment" ? equipmentFields : attachmentFields;
  const assetTypeName = assetType === "equipment" ? "Equipment" : "Attachment";

  // Transform date strings to Date objects and object values to IDs for dropdowns
  const initialData = {
    ...assetData,
    purchase_date: assetData?.purchase_date ? new Date(assetData.purchase_date) : undefined,
    // Transform object values to their IDs for dropdown compatibility
    category: assetData?.category?.id || assetData?.category || "",
    location: assetData?.location?.id || assetData?.location || "",
    equipment: assetData?.equipment?.id || assetData?.equipment || "",
  };

  const customLayout = (props: any) => (
    <FormLayout 
      {...props} 
      config={assetType === "attachment" ? attachmentFormConfig : equipmentFormConfig}
    />
  );

  return (
    <div className="space-y-4">
      <div>
        <ApiForm
          fields={currentFields}
          onSubmit={handleSubmit}
          initialData={initialData}
          customLayout={customLayout}
        />
      </div>

      {/* Compact Tabs Section */}
      <div>
        <Tabs defaultValue="metering-events" className="h-full" onValueChange={setActiveTab}>
          {/* Compact Pill-Style Tab List */}
          <div className="h-10 overflow-x-auto">
            <TabsList className="grid w-full grid-cols-7 h-10 bg-card border border-border rounded-md p-0">
              <TabsTrigger 
                value="metering-events"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Metering/Events
              </TabsTrigger>
              <TabsTrigger 
                value="scheduled-maintenance"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Scheduled Maintenance
              </TabsTrigger>
              <TabsTrigger 
                value="parts-bom" 
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Parts/BOM
              </TabsTrigger>
              <TabsTrigger 
                value="backlog"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Backlog
              </TabsTrigger>
              <TabsTrigger 
                value="financials"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger 
                value="files"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Files
              </TabsTrigger>
              <TabsTrigger 
                value="log"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Log
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Content Panels - Compact */}
          <TabsContent value="parts-bom" className="mt-1">
            <PartsBomTabContent assetId={id || ''} />
          </TabsContent>
          
          <TabsContent value="metering-events" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-[500px] overflow-auto">
              <div className="grid grid-cols-2 gap-6">
                {/* Left side - Meter Readings */}
                <div className="min-w-0">
                  {/* Button */}
                  <div className="mb-1">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center gap-2 px-3 py-1"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Update Reading
                    </Button>
                  </div>

                  {/* Table */}
                  <div className="w-full max-w-full">
                    <ApiTable
                      endpoint={`/meter-readings/meter_reading?asset=${id}`}
                      columns={[
                        { key: 'meter_reading', header: 'Meter Reading' },
                        { 
                          key: 'created_at', 
                          header: 'Creation Date',
                          render: (value: any) => value ? new Date(value).toLocaleDateString() : '-'
                        },
                        { 
                          key: 'created_by', 
                          header: 'Created By',
                          render: (value: any) => {
                            if (typeof value === 'object' && value) {
                              return value.name || value.email || value.id || '-';
                            }
                            return value || '-';
                          }
                        },
                      ]}
                      tableId={`meter-readings-${id}`}
                    />
                  </div>
                </div>

                {/* Right side - Codes */}
                <div className="min-w-0">
                  {/* Button */}
                  <div className="mb-1">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center gap-2 px-3 py-1"
                      onClick={() => setIsCodeDialogOpen(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Update Code
                    </Button>
                  </div>

                  {/* Table */}
                  <div className="w-full max-w-full">
                    <ApiTable
                      endpoint={`/fault-codes/codes?asset=${id}`}
                      columns={[
                        { key: 'code', header: 'Code' },
                        { 
                          key: 'created_at', 
                          header: 'Creation Date',
                          render: (value: any) => value ? new Date(value).toLocaleDateString() : '-'
                        },
                        { 
                          key: 'created_by', 
                          header: 'Created By',
                          render: (value: any) => {
                            if (typeof value === 'object' && value) {
                              return value.name || value.email || value.id || '-';
                            }
                            return value || '-';
                          }
                        },
                      ]}
                      tableId={`codes-${id}`}
                    />
                  </div>
                </div>
              </div>

              {/* Dialog for adding readings */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Meter Reading</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <ApiForm
                      fields={[
                        {
                          name: "meter_reading",
                          type: "input",
                          inputType: "text",
                          required: true,
                          label: "Meter Reading"
                        }
                      ]}
                      onSubmit={async (data) => {
                        const submissionData = {
                          ...data,
                          asset: id
                        };
                        try {
                          await apiCall("/meter-readings/meter_reading", { method: 'POST', body: submissionData });
                          queryClient.invalidateQueries({ queryKey: [`/meter-readings/meter_reading?asset=${id}`] });
                          queryClient.invalidateQueries({ queryKey: ["meter_readings", id] });
                          setIsDialogOpen(false);
                          toast({
                            title: "Success",
                            description: "Meter reading added successfully!",
                          });
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: error.message || "Failed to add meter reading",
                            variant: "destructive",
                          });
                        }
                      }}
                      customLayout={({ handleSubmit, renderField }) => (
                        <div className="space-y-4">
                          {renderField({ 
                            name: "meter_reading", 
                            type: "input", 
                            inputType: "text", 
                            required: true,
                            label: "Meter Reading"
                          })}
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                              Save
                            </Button>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </DialogContent>
              </Dialog>

              {/* Dialog for adding codes */}
              <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <ApiForm
                      fields={[
                        {
                          name: "code",
                          type: "input",
                          inputType: "text",
                          required: true,
                          label: "Code"
                        }
                      ]}
                      onSubmit={async (data) => {
                        const submissionData = {
                          ...data,
                          asset: id
                        };
                        try {
                          await apiCall("/fault-codes/codes", { method: 'POST', body: submissionData });
                          queryClient.invalidateQueries({ queryKey: [`/fault-codes/codes?asset=${id}`] });
                          queryClient.invalidateQueries({ queryKey: ["codes", id] });
                          setIsCodeDialogOpen(false);
                          toast({
                            title: "Success",
                            description: "Code added successfully!",
                          });
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: error.message || "Failed to add code",
                            variant: "destructive",
                          });
                        }
                      }}
                      customLayout={({ handleSubmit, renderField }) => (
                        <div className="space-y-4">
                          {renderField({ 
                            name: "code", 
                            type: "input", 
                            inputType: "text", 
                            required: true,
                            label: "Code"
                          })}
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsCodeDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                              Save
                            </Button>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="scheduled-maintenance" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-2 h-full min-h-[500px] overflow-hidden">
              
              {/* View 1: Two Container Layout */}
              {currentView === 0 && (
                <div className="flex gap-6 h-full relative animate-fade-in">
                  
                  {/* Navigation to View 2 */}
                  <button
                    onClick={() => handleViewChange(1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </button>
                  
                  {/* PM Tasks Container */}
                  <div className="w-1/2 ml-2">
                    <div className="p-6 h-[474px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                      <div className="flex items-center justify-center gap-4 mb-2 py-1 -mx-2 -mt-3 bg-accent/20 border border-accent/30 rounded-md">
                        <h4 className="text-sm font-medium text-primary dark:text-secondary">PM Triggers</h4>
                      </div>
                      
                      <div className="flex-grow space-y-4 overflow-auto">
                        <div className="flex gap-4 h-full">
                          {/* Meter Reading Trigger Container */}
                          <div className="w-1/2">
                            <div className="p-4 h-[380px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                              <h5 className="text-xs font-medium text-primary dark:text-secondary mb-4 text-center">Meter Reading Trigger</h5>
                              
                              <div className="flex-grow space-y-3 overflow-auto">
                                <div className="space-y-3">
                                  {/* Every field */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Every</span>
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        value={meterTriggerData.interval_value}
                                        onChange={(e) => setMeterTriggerData(prev => ({...prev, interval_value: Number(e.target.value)}))}
                                        className="w-16 h-6 px-2 text-xs border rounded bg-background"
                                      />
                                      <select 
                                        value={meterTriggerData.interval_unit}
                                        onChange={(e) => setMeterTriggerData(prev => ({...prev, interval_unit: e.target.value}))}
                                        className="h-6 px-2 text-xs border rounded bg-background"
                                      >
                                        <option value="Hour">Hour</option>
                                        <option value="Day">Day</option>
                                        <option value="Week">Week</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Starting at field */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Starting at</span>
                                    <input 
                                      type="number" 
                                      value={meterTriggerData.start_threshold_value}
                                      onChange={(e) => setMeterTriggerData(prev => ({...prev, start_threshold_value: Number(e.target.value)}))}
                                      className="w-16 h-6 px-2 text-xs border rounded bg-background"
                                    />
                                  </div>

                                  {/* Create WO field */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Create WO</span>
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        value={meterTriggerData.lead_time_value}
                                        onChange={(e) => setMeterTriggerData(prev => ({...prev, lead_time_value: Number(e.target.value)}))}
                                        className="w-16 h-6 px-2 text-xs border rounded bg-background"
                                      />
                                      <span className="text-xs text-muted-foreground">before trigger</span>
                                    </div>
                                  </div>

                                  {/* Active toggle */}
                                  <div className="pt-2">
                                    <Button 
                                      className={`w-full h-8 text-xs ${
                                        meterTriggerData.is_active 
                                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                                      }`}
                                      onClick={() => setMeterTriggerData(prev => ({...prev, is_active: !prev.is_active}))}
                                    >
                                      {meterTriggerData.is_active ? '✓ Active' : '✗ Inactive'}
                                    </Button>
                                  </div>

                                  {/* Save button */}
                                  <div className="pt-2">
                                    <Button 
                                      className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-white"
                                      onClick={handleSaveMeterTrigger}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Calendar Trigger Container */}
                          <div className="w-1/2">
                            <div className="p-4 h-[380px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                              <h5 className="text-xs font-medium text-primary dark:text-secondary mb-4 text-center">Calendar Trigger</h5>
                              
                              <div className="flex-grow space-y-3 overflow-auto">
                                <div className="space-y-3">
                                  {/* Frequency field */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Frequency</span>
                                    <select className="h-6 px-2 text-xs border rounded bg-background">
                                      <option>Daily</option>
                                      <option>Weekly</option>
                                      <option>Monthly</option>
                                      <option>Yearly</option>
                                    </select>
                                  </div>

                                  {/* Start Date field */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Start Date</span>
                                    <div className="relative">
                                      <input 
                                        type="text" 
                                        placeholder="mm/dd/yy" 
                                        className="w-20 h-6 px-2 text-xs border rounded bg-background pr-6"
                                      />
                                      <CalendarIcon className="absolute right-1 top-1 h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>

                                  {/* Create WO field */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Create WO</span>
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        defaultValue="1" 
                                        className="w-12 h-6 px-2 text-xs border rounded bg-background"
                                      />
                                      <span className="text-xs text-muted-foreground">days before</span>
                                    </div>
                                  </div>

                                  {/* Active toggle */}
                                  <div className="pt-2">
                                    <Button 
                                      className={`w-full h-8 text-xs ${
                                        isTimeTriggerActive 
                                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                                      }`}
                                      onClick={() => setIsTimeTriggerActive(!isTimeTriggerActive)}
                                    >
                                      {isTimeTriggerActive ? '✓ Active' : '✗ Inactive'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Configuration Container */}
                  <div className="w-1/2 mr-2">
                    <div className="p-6 h-[474px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                      <div className="flex items-center justify-center gap-4 mb-6 py-1 -mx-2 -mt-3 bg-accent/20 border border-accent/30 rounded-md">
                        <h4 className="text-sm font-medium text-primary dark:text-secondary">Log</h4>
                      </div>
                      
                      <div className="flex-grow space-y-4 overflow-auto">
                        <div className="p-4 text-center text-muted-foreground">
                          Schedule configuration content coming soon...
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              )}

              {/* View 2: Single Big Container Layout */}
              {currentView === 1 && (
                <div className="h-full relative animate-fade-in">
                  
                  {/* Navigation back to View 1 */}
                  <button
                    onClick={() => handleViewChange(0)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <ChevronLeft className="w-4 h-4 text-primary" />
                  </button>

                  {/* Single Big Container */}
                  <div className="h-full">
                    <div className="p-8 h-[474px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                      
                      <div className="absolute top-1 left-8 right-8 flex items-center justify-center gap-4 py-1 bg-accent/20 border border-accent/30 rounded-md z-10">
                        <h4 className="text-sm font-medium text-primary dark:text-secondary">All Scheduled Maintenance</h4>
                      </div>
                      
                      <div className="flex-grow space-y-4 overflow-auto mt-8">
                        <div className="p-4 text-center text-muted-foreground">
                          All scheduled maintenance content coming soon...
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              )}
              
            </div>
          </TabsContent>
          
          <TabsContent value="financials" className="mt-1">
            <FinancialsTabContent assetId={id} />
          </TabsContent>
          
          <TabsContent value="files" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-[500px] overflow-auto">
              <div className="p-4 text-center text-muted-foreground">
                Files content coming soon...
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="backlog" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-[500px] overflow-auto">
              <div className="p-4 text-center text-muted-foreground">
                Backlog content coming soon...
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="log" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-[500px] overflow-auto">
              <div className="p-4 text-center text-muted-foreground">
                Log content coming soon...
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditAsset;