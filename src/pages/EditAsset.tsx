import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { handleApiError } from "@/utils/errorHandling";
import ApiTable from "@/components/ApiTable";
import ApiDropDown from "@/components/ApiDropDown";
import { apiCall } from "@/utils/apis";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle, Trash2, Plus, Check, X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssetData } from "@/hooks/useAssetData";
import { useAssetSubmit } from "@/hooks/useAssetSubmit";
import { equipmentFields, attachmentFields } from "@/data/assetFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import FormLayout from "@/components/FormLayout";
import { equipmentFormConfig, attachmentFormConfig } from "@/config/formLayouts";
import FinancialsTabContent from "@/components/FinancialsTabContent";
import PartsBomTabContent from "@/components/PartsBomTabContent";
import PMChecklistTabs from "@/components/PMChecklistTabs";
import ApiSwitch from "@/components/ApiSwitch";
import ApiDatePicker from "@/components/ApiDatePicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePrefetchFinancialData } from "@/hooks/useFinancialDataOptimized";

const EditAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prefetchFinancialData = usePrefetchFinancialData();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isBacklogDialogOpen, setIsBacklogDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState(0);
  const [activeTab, setActiveTab] = useState("");
  const [isMeterTriggerActive, setIsMeterTriggerActive] = useState(true);
  const [isTimeTriggerActive, setIsTimeTriggerActive] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedRadioId, setSelectedRadioId] = useState<string | null>(null);
  const [isFieldsEditable, setIsFieldsEditable] = useState(false);

  const [meterTriggerData, setMeterTriggerData] = useState({
    name: "",
    interval_value: "",
    interval_unit: "hours",
    start_threshold_value: "",
    lead_time_value: "",
    next_iteration: "",
    is_active: true
  });

  const [calendarTriggerData, setCalendarTriggerData] = useState({
    name: "",
    interval_value: 30,
    interval_unit: "days",
    start_date: "",
    days_in_advance: 5,
    is_active: true
  });

  const { data: pmSettingsData } = useQuery({
    queryKey: [`/pm-automation/pm-settings?asset=${id}`],
    queryFn: async () => {
      const response = await apiCall(`/pm-automation/pm-settings?asset=${id}`);
      return response.data.data || response.data;
    },
  });

  const { assetType, assetData, isLoading, isError, error } = useAssetData(id);
  const { handleSubmit } = useAssetSubmit(id, assetType);

  useEffect(() => {
    if (id) {
      prefetchFinancialData(id);
    }
  }, [id, prefetchFinancialData]);

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
      await apiCall(`/meter-readings/meter_reading/${readingId}`, {
        method: 'DELETE'
      });
      queryClient.invalidateQueries({
        queryKey: [`/meter-readings/meter_reading?asset=${id}`]
      });
      queryClient.invalidateQueries({
        queryKey: ["meter_readings", id]
      });
      toast({
        title: "Success",
        description: "Meter reading deleted successfully!"
      });
    } catch (error: any) {
      handleApiError(error, "Delete Failed");
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      await apiCall(`/fault-codes/codes/${codeId}`, {
        method: 'DELETE'
      });
      queryClient.invalidateQueries({
        queryKey: [`/fault-codes/codes?asset=${id}`]
      });
      queryClient.invalidateQueries({
        queryKey: ["codes", id]
      });
      toast({
        title: "Success",
        description: "Code deleted successfully!"
      });
    } catch (error: any) {
      handleApiError(error, "Delete Failed");
    }
  };

  const handleSaveCalendarTrigger = async () => {
    try {
      const submissionData = {
        name: calendarTriggerData.name,
        interval_value: calendarTriggerData.interval_value,
        interval_unit: calendarTriggerData.interval_unit,
        start_date: calendarTriggerData.start_date,
        days_in_advance: calendarTriggerData.days_in_advance,
        is_active: calendarTriggerData.is_active,
        asset: id
      };
      await apiCall('/pm-automation/calendar-settings/', {
        method: 'POST',
        body: submissionData
      });
      toast({
        title: "Success",
        description: "Calendar Trigger settings saved successfully!"
      });
    } catch (error: any) {
      handleApiError(error, "Save Failed");
    }
  };

  const handleFinancialsTabHover = () => {
    if (id) {
      prefetchFinancialData(id);
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

  const initialData = {
    ...assetData,
    purchase_date: assetData?.purchase_date ? new Date(assetData.purchase_date) : undefined,
    category: assetData?.category?.id || assetData?.category || "",
    location: assetData?.location?.id || assetData?.location || "",
    weight_class: assetData?.weight_class?.id || assetData?.weight_class || "",
    year: assetData?.year ? assetData.year.toString() : "",
    equipment: assetData?.equipment?.id || assetData?.equipment || "",
    project: assetData?.project?.id || assetData?.project || "",
    account_code: assetData?.account_code?.id || assetData?.account_code || "",
    job_code: assetData?.job_code?.id || assetData?.job_code || "",
    asset_status: assetData?.asset_status?.id || assetData?.asset_status || ""
  };

  const customLayout = (props: any) => <FormLayout {...props} config={assetType === "attachment" ? attachmentFormConfig : equipmentFormConfig} />;

  return (
    <div className="h-full overflow-x-auto min-w-0 flex flex-col">
      <div className="space-y-4 min-w-[1440px] flex-1 flex flex-col">
        <div>
          <ApiForm fields={currentFields} onSubmit={handleSubmit} initialData={initialData} customLayout={customLayout} />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="metering-events" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
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
              <PartsBomTabContent assetId={id || ''} />
            </TabsContent>
            
            <TabsContent value="metering-events" className="tab-content-container">
              <div className="tab-content-metering">
                <div className="tab-content-grid-2">
                  <div className="min-w-0">
                    <div className="mb-1">
                      <Button variant="default" size="sm" className="flex items-center gap-2 px-3 py-1" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-3 w-3" />
                        Update Reading
                      </Button>
                    </div>

                    <div className="w-full max-w-full">
                       <ApiTable endpoint={`/meter-readings/meter_reading?asset=${id}`} columns={[{
                         key: 'meter_reading',
                         header: 'Meter Reading'
                       }, {
                         key: 'created_at',
                         header: 'Creation Date',
                         render: (value: any) => value ? new Date(value).toLocaleDateString() : '-'
                       }, {
                         key: 'created_by',
                         header: 'Created By',
                         render: (value: any) => {
                           if (typeof value === 'object' && value) {
                             return value.name || value.email || value.id || '-';
                           }
                           return value || '-';
                         }
                       }, {
                         key: 'actions',
                         header: '',
                         render: (value: any, row: any) => (
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-end">
                             <Button
                               variant="ghost"
                               size="sm"
                               className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                               onClick={() => handleDeleteMeterReading(row.id)}
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                         )
                       }]} tableId={`meter-readings-${id}`} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-1">
                      <Button variant="default" size="sm" className="flex items-center gap-2 px-3 py-1" onClick={() => setIsCodeDialogOpen(true)}>
                        <Plus className="h-3 w-3" />
                        Update Code
                      </Button>
                    </div>

                    <div className="w-full max-w-full">
                      <ApiTable endpoint={`/fault-codes/codes?asset=${id}`} columns={[{
                        key: 'code',
                        header: 'Code'
                      }, {
                        key: 'created_at',
                        header: 'Creation Date',
                        render: (value: any) => value ? new Date(value).toLocaleDateString() : '-'
                      }, {
                        key: 'created_by',
                        header: 'Created By',
                        render: (value: any) => {
                          if (typeof value === 'object' && value) {
                            return value.name || value.email || value.id || '-';
                          }
                          return value || '-';
                        }
                      }]} tableId={`codes-${id}`} />
                    </div>
                  </div>
                </div>

                {/* Dialogs for adding meter readings and codes */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Meter Reading</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <ApiForm fields={[{
                        name: "meter_reading",
                        type: "input",
                        inputType: "text",
                        required: true,
                        label: "Meter Reading"
                      }]} onSubmit={async data => {
                        const submissionData = {
                          ...data,
                          asset: id
                        };
                        try {
                          await apiCall("/meter-readings/meter_reading", {
                            method: 'POST',
                            body: submissionData
                          });
                          queryClient.invalidateQueries({
                            queryKey: [`/meter-readings/meter_reading?asset=${id}`]
                          });
                          queryClient.invalidateQueries({
                            queryKey: ["meter_readings", id]
                          });
                          setIsDialogOpen(false);
                          toast({
                            title: "Success",
                            description: "Meter reading added successfully!"
                          });
                        } catch (error: any) {
                          handleApiError(error, "Save Failed");
                        }
                      }} customLayout={({
                        handleSubmit,
                        renderField
                      }) => (
                        <div className="space-y-4">
                          {renderField({
                            name: "meter_reading",
                            type: "input",
                            inputType: "text",
                            required: true,
                            label: "Meter Reading"
                          })}
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                              Save
                            </Button>
                          </div>
                        </div>
                      )} />
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Code</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <ApiForm fields={[{
                        name: "code",
                        type: "input",
                        inputType: "text",
                        required: true,
                        label: "Code"
                      }]} onSubmit={async data => {
                        const submissionData = {
                          ...data,
                          asset: id
                        };
                        try {
                          await apiCall("/fault-codes/codes", {
                            method: 'POST',
                            body: submissionData
                          });
                          queryClient.invalidateQueries({
                            queryKey: [`/fault-codes/codes?asset=${id}`]
                          });
                          queryClient.invalidateQueries({
                            queryKey: ["codes", id]
                          });
                          setIsCodeDialogOpen(false);
                          toast({
                            title: "Success",
                            description: "Code added successfully!"
                          });
                        } catch (error: any) {
                          handleApiError(error, "Save Failed");
                        }
                      }} customLayout={({
                        handleSubmit,
                        renderField
                      }) => (
                        <div className="space-y-4">
                          {renderField({
                            name: "code",
                            type: "input",
                            inputType: "text",
                            required: true,
                            label: "Code"
                          })}
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsCodeDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                              Save
                            </Button>
                          </div>
                        </div>
                      )} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            <TabsContent value="scheduled-maintenance" className="tab-content-container">
              <div className="h-full flex flex-col">
                {currentView === 0 && (
                  <div className="space-y-4 h-full">
                    {/* PM Settings Table and Generate WO Button */}
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-foreground">PM Settings</h4>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex items-center gap-2"
                          onClick={() => {
                            toast({
                              title: "Generate WO",
                              description: "Work order generation initiated!"
                            });
                          }}
                        >
                          <Plus className="h-3 w-3" />
                          Generate WO Now
                        </Button>
                      </div>
                      <div className="max-h-[200px] overflow-auto">
                        <ApiTable
                          endpoint={`/pm-automation/pm-settings?asset=${id}`}
                          columns={[
                            { key: 'name', header: 'Name', type: 'string' },
                            { key: 'trigger_type', header: 'Trigger Type', type: 'string' },
                            { key: 'interval_value', header: 'Interval', type: 'string' },
                            { key: 'is_active', header: 'Status', type: 'boolean', render: (value: boolean) => value ? '✓ Active' : '✗ Inactive' },
                            { 
                              key: 'actions', 
                              header: '', 
                              render: (value: any, row: any) => (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedItemId(row.id);
                                    handleViewChange(1);
                                  }}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              )
                            }
                          ]}
                          queryKey={['pm-settings', id]}
                          tableId={`pm-settings-${id}`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 flex-1">
                      {/* Meter Reading Trigger - Improved Layout */}
                      <div className="w-1/4">
                        <div className="bg-card border border-border rounded-lg p-6 h-full">
                          <div className="flex items-center justify-center mb-4">
                            <h5 className="text-sm font-medium text-foreground">Meter Reading Trigger</h5>
                          </div>
                          
                          {/* 2x2 Grid Layout for the 4 fields */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Name</label>
                              <input 
                                type="text" 
                                value={meterTriggerData.name} 
                                onChange={e => setMeterTriggerData(prev => ({
                                  ...prev,
                                  name: e.target.value
                                }))} 
                                className="w-full h-8 px-2 text-sm border border-border rounded bg-background" 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Every</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={meterTriggerData.interval_value} 
                                  onChange={e => setMeterTriggerData(prev => ({
                                    ...prev,
                                    interval_value: e.target.value
                                  }))} 
                                  className="flex-1 h-8 px-2 text-sm border border-border rounded bg-background" 
                                />
                                <select 
                                  value={meterTriggerData.interval_unit} 
                                  onChange={e => setMeterTriggerData(prev => ({
                                    ...prev,
                                    interval_unit: e.target.value
                                  }))} 
                                  className="h-8 px-2 text-sm border border-border rounded bg-background"
                                >
                                  <option value="hours">hrs</option>
                                  <option value="miles">mi</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Starting at</label>
                              <input 
                                type="text" 
                                value={meterTriggerData.start_threshold_value} 
                                onChange={e => setMeterTriggerData(prev => ({
                                  ...prev,
                                  start_threshold_value: e.target.value
                                }))} 
                                className="w-full h-8 px-2 text-sm border border-border rounded bg-background" 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Create WO</label>
                              <div className="flex gap-2 items-center">
                                <input 
                                  type="text" 
                                  value={meterTriggerData.lead_time_value} 
                                  onChange={e => setMeterTriggerData(prev => ({
                                    ...prev,
                                    lead_time_value: e.target.value
                                  }))} 
                                  className="flex-1 h-8 px-2 text-sm border border-border rounded bg-background" 
                                />
                                <span className="text-xs text-muted-foreground">before</span>
                              </div>
                            </div>
                          </div>

                          {/* Next Iteration dropdown field */}
                          <div className="space-y-2 mb-6">
                            <label className="text-xs text-muted-foreground">Next Iteration</label>
                            <select 
                              value={meterTriggerData.next_iteration} 
                              onChange={e => setMeterTriggerData(prev => ({
                                ...prev,
                                next_iteration: e.target.value
                              }))} 
                              className="w-full h-8 px-2 text-sm border border-border rounded bg-background"
                            >
                              <option value="">Select Iteration</option>
                              <option value="iteration1">Iteration 1</option>
                              <option value="iteration2">Iteration 2</option>
                              <option value="iteration3">Iteration 3</option>
                            </select>
                          </div>

                          <div className="space-y-4">
                            <Button 
                              className={`w-full h-8 text-xs ${meterTriggerData.is_active ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`} 
                              onClick={() => setMeterTriggerData(prev => ({
                                ...prev,
                                is_active: !prev.is_active
                              }))}
                            >
                              {meterTriggerData.is_active ? '✓ Active' : '✗ Inactive'}
                            </Button>
                            
                            <Button className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Calendar Trigger */}
                      <div className="w-1/4">
                        <div className="bg-card border border-border rounded-lg p-6 h-full">
                          <div className="flex items-center justify-center mb-4">
                            <h5 className="text-sm font-medium text-foreground">Calendar Trigger</h5>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Name</span>
                              <input 
                                type="text" 
                                value={calendarTriggerData.name} 
                                onChange={e => setCalendarTriggerData(prev => ({
                                  ...prev,
                                  name: e.target.value
                                }))} 
                                className="w-32 h-6 px-2 text-xs border rounded bg-background" 
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Every</span>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  value={calendarTriggerData.interval_value} 
                                  onChange={e => setCalendarTriggerData(prev => ({
                                    ...prev,
                                    interval_value: Number(e.target.value)
                                  }))} 
                                  className="w-16 h-6 px-2 text-xs border rounded bg-background" 
                                />
                                <select 
                                  value={calendarTriggerData.interval_unit} 
                                  onChange={e => setCalendarTriggerData(prev => ({
                                    ...prev,
                                    interval_unit: e.target.value
                                  }))} 
                                  className="h-6 px-2 text-xs border rounded bg-background w-20"
                                >
                                  <option value="days">days</option>
                                  <option value="weeks">weeks</option>
                                  <option value="months">months</option>
                                  <option value="years">years</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Starting at</span>
                              <input 
                                type="date" 
                                value={calendarTriggerData.start_date} 
                                onChange={e => setCalendarTriggerData(prev => ({
                                  ...prev,
                                  start_date: e.target.value
                                }))} 
                                className="w-32 h-6 px-2 text-xs border rounded bg-background" 
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Create WO</span>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  value={calendarTriggerData.days_in_advance} 
                                  onChange={e => setCalendarTriggerData(prev => ({
                                    ...prev,
                                    days_in_advance: Number(e.target.value)
                                  }))} 
                                  className="w-16 h-6 px-2 text-xs border rounded bg-background" 
                                />
                                <span className="text-xs text-muted-foreground w-20">days before</span>
                              </div>
                            </div>
                            <Button 
                              className={`w-full h-8 text-xs ${calendarTriggerData.is_active ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`} 
                              onClick={() => setCalendarTriggerData(prev => ({
                                ...prev,
                                is_active: !prev.is_active
                              }))}
                            >
                              {calendarTriggerData.is_active ? '✓ Active' : '✗ Inactive'}
                            </Button>
                            <Button className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSaveCalendarTrigger}>
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Log Section */}
                      <div className="w-1/2">
                        <div className="bg-card border border-border rounded-lg p-6 h-full">
                          <div className="flex items-center justify-center mb-4">
                            <h4 className="text-sm font-medium text-foreground">Log</h4>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold mb-4">Auto Generated Work Orders</h3>
                              <div className="max-h-[200px] overflow-auto border rounded-md">
                                <ApiTable
                                  endpoint="/work-orders/work_order"
                                  filters={{
                                    asset: id,
                                    is_pm_generated: true
                                  }}
                                  columns={[
                                    { key: 'code', header: 'Code', type: 'string' },
                                    { key: 'description', header: 'Description', type: 'string' },
                                    { key: 'status', header: 'Status', type: 'object', render: (value: any) => value?.control?.name || value?.name || '-' },
                                    { key: 'completion_meter_reading', header: 'Completion Meter Reading', type: 'string' },
                                    { key: 'trigger_meter_reading', header: 'Trigger Meter Reading', type: 'string' },
                                  ]}
                                  queryKey={['auto-generated-work-orders', id]}
                                  tableId={`auto-generated-work-orders-${id}`}
                                  editRoutePattern="/workorders/edit/{id}"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentView === 1 && (
                  <div className="h-full relative">
                    <button 
                      onClick={() => handleViewChange(0)} 
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <ChevronLeft className="w-4 h-4 text-primary" />
                    </button>
                    <div className="h-full bg-card border border-border rounded-lg p-6">
                      <div className="flex items-center justify-center mb-4">
                        <h4 className="text-sm font-medium text-foreground">PM Checklist/Parts</h4>
                      </div>
                      <div className="h-full overflow-auto">
                        <PMChecklistTabs 
                          assetId={id || ''} 
                          selectedPmId={selectedItemId}
                          onNavigateBack={() => handleViewChange(0)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="financials" className="tab-content-container">
              <FinancialsTabContent assetId={id || ''} />
            </TabsContent>
            
            <TabsContent value="files" className="tab-content-container">
              <div className="tab-content-generic">
                <div className="p-4 text-center text-muted-foreground">
                  Files content will be displayed here.
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="components" className="tab-content-container">
              <div className="tab-content-generic">
                <div className="p-4 text-center text-muted-foreground">
                  Components content will be displayed here.
                </div>
              </div>
            </TabsContent>

            <TabsContent value="backlog" className="tab-content-container">
              <div className="tab-content-generic">
                <div className="p-4 text-center text-muted-foreground">
                  Backlog content will be displayed here.
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="log" className="tab-content-container">
              <div className="tab-content-generic">
                <div className="p-4 text-center text-muted-foreground">
                  Log content will be displayed here.
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EditAsset;