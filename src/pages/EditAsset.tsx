import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import ApiTable from "@/components/ApiTable";
import { apiCall } from "@/utils/apis";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle, Trash2, Plus, Check, X } from "lucide-react";
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
    <div className="space-y-6">
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
        <Tabs defaultValue="parts-bom" className="h-full" onValueChange={setActiveTab}>
          {/* Compact Pill-Style Tab List */}
          <div className="h-10 overflow-x-auto">
            <TabsList className="grid w-full grid-cols-7 h-10 bg-card border border-border rounded-md p-0">
              <TabsTrigger 
                value="parts-bom" 
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Parts/BOM
              </TabsTrigger>
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
                value="backlog"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Backlog
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
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Parts/BOM</h3>
              <p className="text-caption text-muted-foreground">Parts and Bill of Materials content will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="metering-events" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <div className="flex gap-6">
                {/* Left side - Meter Readings */}
                <div className="w-1/2">
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
                  <div className="w-5/6">
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
                <div className="w-1/2">
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
                  <div className="w-5/6">
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
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px] overflow-hidden">
              {/* Sliding Container Wrapper */}
              <div className="relative w-full h-full">
                <div 
                  className="flex w-[200%] h-full transition-transform duration-300 ease-in-out gap-6"
                  style={{ transform: `translateX(-${currentView * 50}%)` }}
                >
                  {/* View 1: Trigger + Log */}
                  <div className="flex flex-col lg:flex-row w-1/2 h-full flex-shrink-0 gap-3">
                    {/* Trigger Container */}
                    <div className="w-full lg:w-1/2">
                      <div className="p-4 md:p-6 lg:p-10 space-y-4 h-auto lg:h-[474px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b before:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                        <div className="flex items-center justify-center gap-4 mb-4 lg:mb-6 py-1 -mx-2 -mt-5 bg-accent/20 border border-accent/30 rounded-md">
                          <h4 className="text-sm md:text-h3 font-medium text-primary dark:text-secondary">Trigger</h4>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 h-full">
                          {/* Meter Reading Trigger Container */}
                          <div className="w-full lg:w-1/2">
                            <div className="p-4 md:p-6 lg:p-10 h-auto lg:h-[380px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 before:top-4 before:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                              <h5 className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs md:text-sm font-medium text-primary dark:text-secondary">Meter Reading Trigger</h5>
                              
                              {/* Maintenance Table */}
                              <div className="mt-4 mb-4">
                                <div className="border border-border rounded-md overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead className="bg-muted">
                                      <tr>
                                        <th className="px-1 md:px-2 py-1 text-left font-medium text-xs">Maint Name</th>
                                        <th className="px-1 md:px-2 py-1 text-left font-medium text-xs">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr className="border-t border-border">
                                        <td className="px-1 md:px-2 py-1 text-xs">Engine Service</td>
                                        <td className="px-1 md:px-2 py-1">
                                          <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">Active</span>
                                        </td>
                                      </tr>
                                      <tr className="border-t border-border">
                                        <td className="px-1 md:px-2 py-1 text-xs">Oil Change</td>
                                        <td className="px-1 md:px-2 py-1">
                                          <span className="px-1 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">Pending</span>
                                        </td>
                                      </tr>
                                      <tr className="border-t border-border">
                                        <td className="px-1 md:px-2 py-1 text-xs">Filter Replace</td>
                                        <td className="px-1 md:px-2 py-1">
                                          <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Scheduled</span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Spacer to push content down but not to the very bottom */}
                              <div className="flex-grow min-h-[20px]"></div>
                                  
                              {/* Form fields positioned in lower portion */}
                              <div className="grid gap-2 md:gap-3 p-3 md:p-4 border-2 border-dashed border-primary/30 rounded-xl bg-gradient-to-br from-card/50 to-background/30 shadow-inner backdrop-blur-sm">
                                   {/* Every field */}
                                   <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-2 items-center">
                                     <label className="text-xs md:text-sm font-normal text-foreground">Every</label>
                                     <div className="grid grid-cols-2 gap-2">
                                       <input
                                         type="number"
                                         defaultValue="500"
                                         className="w-full px-2 py-1 text-xs md:text-sm bg-transparent border-0 border-b border-primary focus:outline-none focus:border-b-2 focus:border-primary transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                       />
                                       <select className="w-full px-2 py-1 text-xs md:text-sm bg-transparent border-0 border-b border-primary focus:outline-none focus:border-b-2 focus:border-primary transition-all duration-200 appearance-none cursor-pointer">
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                        <option value="weeks">Weeks</option>
                                        <option value="months">Months</option>
                                        <option value="years">Years</option>
                                        <option value="miles">Miles</option>
                                        <option value="kilometers">Kilometers</option>
                                      </select>
                                     </div>
                                   </div>
                                  
                                   {/* Starting at field */}
                                   <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-2 items-center">
                                     <label className="text-xs md:text-sm font-normal text-foreground">Starting at</label>
                                     <input
                                       type="number"
                                       defaultValue="250"
                                       className="w-full px-2 py-1 text-xs md:text-sm bg-transparent border-0 border-b border-primary focus:outline-none focus:border-b-2 focus:border-primary transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                     />
                                   </div>
                                  
                                   {/* Create WO field */}
                                   <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-2 items-center">
                                     <label className="text-xs md:text-sm font-normal text-foreground">Create WO</label>
                                     <div className="flex items-center gap-2">
                                       <input
                                         type="number"
                                         defaultValue="50"
                                         className="w-16 px-2 py-1 text-xs md:text-sm bg-transparent border-0 border-b border-primary focus:outline-none focus:border-b-2 focus:border-primary transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                       />
                                       <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">before trigger</span>
                                     </div>
                                   </div>
                              </div>
                              
                              {/* Status Toggle Button - positioned at the bottom */}
                              <div className="flex justify-center pb-0">
                                <div 
                                  className={`flex items-center cursor-pointer transition-all duration-300 rounded border w-32 md:w-48 h-6 md:h-8 ${
                                    isMeterTriggerActive 
                                      ? 'bg-green-500 border-green-600' 
                                      : 'bg-red-500 border-red-600'
                                  }`}
                                  onClick={() => setIsMeterTriggerActive(!isMeterTriggerActive)}
                                >
                                  <div className="flex items-center justify-center gap-1 text-xs md:text-sm font-medium text-white w-full">
                                    {isMeterTriggerActive ? (
                                      <>
                                        <Check size={12} />
                                        Active
                                      </>
                                    ) : (
                                      <>
                                        <X size={12} />
                                        Inactive
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Time Trigger Container */}
                          <div className="w-full lg:w-1/2">
                            <div className="p-4 md:p-6 lg:p-10 h-auto lg:h-[380px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 before:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                              <h5 className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs md:text-sm font-medium text-primary dark:text-secondary">Time Trigger</h5>
                              
                              {/* Maintenance Table */}
                              <div className="mt-4 mb-4">
                                <div className="border border-border rounded-md overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead className="bg-muted">
                                      <tr>
                                        <th className="px-1 md:px-2 py-1 text-left font-medium text-xs">Maint Name</th>
                                        <th className="px-1 md:px-2 py-1 text-left font-medium text-xs">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr className="border-t border-border">
                                        <td className="px-1 md:px-2 py-1 text-xs">Hydraulic Check</td>
                                        <td className="px-1 md:px-2 py-1">
                                          <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">Complete</span>
                                        </td>
                                      </tr>
                                      <tr className="border-t border-border">
                                        <td className="px-1 md:px-2 py-1 text-xs">Brake Service</td>
                                        <td className="px-1 md:px-2 py-1">
                                          <span className="px-1 py-0.5 text-xs bg-red-100 text-red-800 rounded">Overdue</span>
                                        </td>
                                      </tr>
                                      <tr className="border-t border-border">
                                        <td className="px-1 md:px-2 py-1 text-xs">Tire Rotation</td>
                                        <td className="px-1 md:px-2 py-1">
                                          <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Upcoming</span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Spacer to push content down but not to the very bottom */}
                              <div className="flex-grow min-h-[20px]"></div>
                              
                              {/* Form fields positioned in lower portion */}
                               <div className="grid gap-2 md:gap-3 p-3 md:p-4 border-2 border-dashed border-primary/30 rounded-xl bg-gradient-to-br from-card/50 to-background/30 shadow-inner backdrop-blur-sm">
                                 {/* Frequency field */}
                                 <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-2 items-center">
                                   <label className="text-xs md:text-sm font-normal text-foreground">Frequency</label>
                                   <select className="w-full px-2 py-1 text-xs md:text-sm bg-transparent border-0 border-b border-primary focus:outline-none focus:border-b-2 focus:border-primary transition-all duration-200 appearance-none cursor-pointer">
                                     <option value="daily">Daily</option>
                                     <option value="weekly">Weekly</option>
                                     <option value="monthly">Monthly</option>
                                     <option value="quarterly">Quarterly</option>
                                     <option value="annually">Annually</option>
                                   </select>
                                 </div>
                                
                                 {/* Start Date field */}
                                 <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-2 items-center">
                                   <label className="text-xs md:text-sm font-normal text-foreground">Start Date</label>
                                   <input
                                     type="date"
                                     className="w-full px-2 py-1 text-xs md:text-sm bg-transparent border-0 border-b border-primary focus:outline-none focus:border-b-2 focus:border-primary transition-all duration-200"
                                   />
                                 </div>
                                
                                 {/* Create WO field */}
                                 <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-2 items-center">
                                   <label className="text-xs md:text-sm font-normal text-foreground">Create WO</label>
                                   <div className="flex items-center gap-2">
                                     <input
                                       type="number"
                                       defaultValue="1"
                                       className="w-16 px-2 py-1 text-xs md:text-sm bg-transparent border-0 border-b border-primary focus:outline-none focus:border-b-2 focus:border-primary transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                     />
                                     <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">days before due</span>
                                   </div>
                                 </div>
                              </div>
                              
                              {/* Status Toggle Button - positioned at the bottom */}
                              <div className="flex justify-center pb-0">
                                <div 
                                  className={`flex items-center cursor-pointer transition-all duration-300 rounded border w-32 md:w-48 h-6 md:h-8 ${
                                    isTimeTriggerActive 
                                      ? 'bg-green-500 border-green-600' 
                                      : 'bg-red-500 border-red-600'
                                  }`}
                                  onClick={() => setIsTimeTriggerActive(!isTimeTriggerActive)}
                                >
                                  <div className="flex items-center justify-center gap-1 text-xs md:text-sm font-medium text-white w-full">
                                    {isTimeTriggerActive ? (
                                      <>
                                        <Check size={12} />
                                        Active
                                      </>
                                    ) : (
                                      <>
                                        <X size={12} />
                                        Inactive
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Log Container with Right Arrow */}
                    <div className="w-full lg:w-1/2 pl-0 lg:pl-3">
                      <div className="p-4 md:p-6 lg:p-10 space-y-4 h-auto lg:h-[474px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                        {/* Right Arrow Navigation */}
                        <button
                          onClick={() => handleViewChange(1)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        >
                          <ChevronRight className="w-4 h-4 text-primary" />
                        </button>
                        
                        <div className="absolute top-1 left-8 right-8 flex items-center justify-center gap-4 py-1 bg-accent/20 border border-accent/30 rounded-md z-10">
                          <h4 className="text-h3 font-medium text-primary dark:text-secondary">Log</h4>
                        </div>
                        
                          <div className="pt-2 overflow-auto max-h-[500px]">
                            {/* Work Orders Table */}
                            <div className="space-y-2 mt-2">
                              <h6 className="text-sm font-medium text-foreground">Work Orders</h6>
                              <div className="border border-border rounded-md overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-muted">
                                    <tr>
                                      <th className="px-3 py-2 text-left font-medium">Date</th>
                                      <th className="px-3 py-2 text-left font-medium">Log Type</th>
                                      <th className="px-3 py-2 text-left font-medium">Notes</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-t border-border">
                                      <td className="px-3 py-2">01/22/2024</td>
                                      <td className="px-3 py-2">
                                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Inspection</span>
                                      </td>
                                      <td className="px-3 py-2">Routine inspection completed</td>
                                    </tr>
                                    <tr className="border-t border-border">
                                      <td className="px-3 py-2">01/20/2024</td>
                                      <td className="px-3 py-2">
                                        <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">Maintenance</span>
                                      </td>
                                      <td className="px-3 py-2">Oil change performed</td>
                                    </tr>
                                    <tr className="border-t border-border">
                                      <td className="px-3 py-2">01/18/2024</td>
                                      <td className="px-3 py-2">
                                        <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">Repair</span>
                                      </td>
                                      <td className="px-3 py-2">Fixed hydraulic leak</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Activity Log Table */}
                            <div className="space-y-2 mt-6">
                             <h6 className="text-sm font-medium text-foreground">Activity Log</h6>
                             <div className="border border-border rounded-md overflow-hidden">
                               <table className="w-full text-sm">
                                 <thead className="bg-muted">
                                   <tr>
                                     <th className="px-3 py-2 text-left font-medium">Date</th>
                                     <th className="px-3 py-2 text-left font-medium">Log Type</th>
                                     <th className="px-3 py-2 text-left font-medium">Notes</th>
                                   </tr>
                                 </thead>
                                 <tbody>
                                   <tr className="border-t border-border">
                                     <td className="px-3 py-2">01/22/2024</td>
                                     <td className="px-3 py-2">
                                       <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Inspection</span>
                                     </td>
                                     <td className="px-3 py-2">Routine inspection completed</td>
                                   </tr>
                                    <tr className="border-t border-border">
                                      <td className="px-3 py-2">01/20/2024</td>
                                      <td className="px-3 py-2">
                                        <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">Maintenance</span>
                                      </td>
                                      <td className="px-3 py-2">Oil change performed</td>
                                    </tr>
                                    <tr className="border-t border-border">
                                      <td className="px-3 py-2">01/16/2024</td>
                                      <td className="px-3 py-2">
                                        <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">Service</span>
                                      </td>
                                      <td className="px-3 py-2">Annual service completed</td>
                                    </tr>
                                 </tbody>
                               </table>
                             </div>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* View 2: PM Checklist (Full Width) */}
                  <div className="w-1/2 h-full flex-shrink-0 pr-6">
                    {/* PM Checklist Container with Left Arrow - Full Width */}
                    <div className="w-full">
                      <div className="p-10 space-y-4 h-[474px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                        {/* Left Arrow Navigation */}
                        <button
                          onClick={() => handleViewChange(0)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        >
                          <ChevronLeft className="w-4 h-4 text-primary" />
                        </button>
                        
                        <div className="absolute top-1 left-8 right-8 flex items-center gap-4 py-1 bg-accent/20 border border-accent/30 rounded-md z-10">
                          <h4 className="text-h3 font-medium text-primary dark:text-secondary ml-6">PM Checklist/Parts</h4>
                        </div>
                        <p className="text-caption text-muted-foreground text-center pt-12">
                          PM Checklist items will be added here
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation Dots */}
                <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  <button
                    onClick={() => handleViewChange(0)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      currentView === 0 ? 'bg-primary' : 'bg-primary/30'
                    }`}
                  />
                  <button
                    onClick={() => handleViewChange(1)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      currentView === 1 ? 'bg-primary' : 'bg-primary/30'
                    }`}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="financials" className="mt-1">
            <FinancialsTabContent assetId={id} />
          </TabsContent>
          
          <TabsContent value="files" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Files</h3>
              <p className="text-caption text-muted-foreground">File attachments and documents will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="backlog" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Backlog</h3>
              <p className="text-caption text-muted-foreground">Backlog items and tasks will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="log" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Log</h3>
              <p className="text-caption text-muted-foreground">Activity log content will go here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditAsset;