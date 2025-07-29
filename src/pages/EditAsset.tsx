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

  const pmTriggers = pmSettingsData || [];

  const fetchPmTriggers = async () => {
    queryClient.invalidateQueries({
      queryKey: [`/pm-automation/pm-settings?asset=${id}`]
    });
  };

  const handleEditTrigger = (trigger: any) => {
    setMeterTriggerData({
      name: trigger.name,
      interval_value: trigger.interval_value,
      interval_unit: trigger.interval_unit,
      start_threshold_value: trigger.start_threshold_value,
      lead_time_value: trigger.lead_time_value,
      next_iteration: trigger.next_iteration,
      is_active: trigger.is_active
    });
    setSelectedItemId(trigger.id);
    setIsEditMode(true);
    setIsFieldsEditable(true);
  };

  const handleDeleteTrigger = async (triggerId: string) => {
    try {
      await apiCall(`/pm-automation/pm-settings/${triggerId}`, {
        method: 'DELETE'
      });
      toast({
        title: "Success",
        description: "PM Trigger deleted successfully!"
      });
      fetchPmTriggers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete PM Trigger",
        variant: "destructive"
      });
    }
  };

  const generateWorkOrder = async () => {
    try {
      const response = await apiCall('/work-order/work-orders', {
        method: 'POST',
        body: {
          title: `Maintenance for ${assetData?.name || 'Asset'}`,
          description: 'Generated work order for scheduled maintenance',
          asset: id,
          status: 'draft'
        }
      });
      toast({
        title: "Success",
        description: "Work order generated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate work order",
        variant: "destructive"
      });
    }
  };

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
    return <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>;
  }

  if (isError) {
    return <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load asset data: {error?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
      </div>;
  }

  if (!assetType || !assetData) {
    return <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>;
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

  return <div className="h-full overflow-x-auto min-w-0 flex flex-col">
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
                    }) => <div className="space-y-4">
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
                        </div>} />
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
                        toast({
                          title: "Error",
                          description: error.message || "Failed to add code",
                          variant: "destructive"
                        });
                      }
                    }} customLayout={({
                      handleSubmit,
                      renderField
                    }) => <div className="space-y-4">
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
                        </div>} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="scheduled-maintenance" className="tab-content-container">
            <div className="tab-content-maintenance">
              {currentView === 0 && (
                <div className="flex gap-4 h-full relative animate-fade-in">
                  <button onClick={() => handleViewChange(1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </button>
                  <div className="w-1/4">
                     <div className="px-4 pt-4 pb-0 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 before:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                        <div className="flex items-center justify-center gap-4 mb-2 py-1 -mx-2 mt-0 bg-accent/20 border border-accent/30 rounded-md">
                          <h5 className="text-xs font-medium text-primary dark:text-secondary">Meter Reading Trigger</h5>
                        </div>
                        <div className="mb-4">
                          <div className="overflow-auto h-[120px]">
                            <table className="w-full caption-bottom text-sm">
                              <thead>
                                <tr className="border-b border-border/40">
                                  <th className="h-8 px-2 text-left align-middle font-medium text-muted-foreground text-xs">Name</th>
                                  <th className="h-8 px-2 text-left align-middle font-medium text-muted-foreground text-xs">Frequency</th>
                                  <th className="h-8 px-2 text-left align-middle font-medium text-muted-foreground text-xs">Status</th>
                                  <th className="h-8 px-2 text-left align-middle font-medium text-muted-foreground text-xs">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pmTriggers.map((trigger) => (
                                  <tr key={trigger.id} className="border-b border-border/40 hover:bg-muted/50 cursor-pointer">
                                    <td className="p-2 text-xs">{trigger.name}</td>
                                    <td className="p-2 text-xs">{trigger.interval_value} {trigger.interval_unit}</td>
                                    <td className="p-2 text-xs">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${trigger.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {trigger.is_active ? 'Active' : 'Inactive'}
                                      </span>
                                    </td>
                                    <td className="p-2">
                                      <div className="flex gap-1">
                                        <button 
                                          onClick={() => handleEditTrigger(trigger)} 
                                          className="h-6 w-6 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded flex items-center justify-center transition-all duration-200 hover:scale-110"
                                        >
                                          <Edit2 className="w-3 h-3 text-blue-600" />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteTrigger(trigger.id)} 
                                          className="h-6 w-6 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded flex items-center justify-center transition-all duration-200 hover:scale-110"
                                        >
                                          <Trash2 className="w-3 h-3 text-red-600" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="mt-auto">
                          <Button 
                            className="w-full h-8 text-xs bg-blue-500 hover:bg-blue-600 text-white" 
                            onClick={() => {
                              setMeterTriggerData({
                                name: '',
                                interval_value: '',
                                interval_unit: 'hours',
                                start_threshold_value: '',
                                lead_time_value: '',
                                next_iteration: 0,
                                is_active: false
                              });
                              setSelectedItemId(null);
                              setIsEditMode(false);
                              setIsFieldsEditable(true);
                            }}
                          >
                            + Add PM Trigger
                          </Button>
                        </div>
                     </div>
                  </div>

                  <div className="w-1/4">
                      <div className="px-4 pt-4 pb-0 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b before:from-primary/60 before:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                          <div className="flex-grow overflow-auto flex flex-col justify-end pb-4">
                            {/* Meter Reading Trigger Configuration Card */}
                            <div className="bg-card border rounded-lg p-4 space-y-4 shadow-sm">
                              <div className="border-b pb-2 mb-4">
                                <h4 className="text-sm font-medium text-foreground">Meter Reading Trigger</h4>
                                <p className="text-xs text-muted-foreground mt-1">Configure automatic work order generation</p>
                              </div>
                              
                              {/* Name Field */}
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-foreground">Trigger Name</label>
                                <input 
                                  type="text" 
                                  value={meterTriggerData.name} 
                                  onChange={e => setMeterTriggerData(prev => ({
                                    ...prev,
                                    name: e.target.value
                                  }))} 
                                  disabled={!isFieldsEditable}
                                  placeholder="Enter trigger name..."
                                  className={`w-full h-9 px-3 text-sm border rounded-md transition-colors ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background hover:border-muted-foreground/50 focus:border-primary'}`}
                                />
                              </div>

                              {/* Interval Configuration */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-foreground">Interval Value</label>
                                  <input 
                                    type="number" 
                                    value={meterTriggerData.interval_value} 
                                    onChange={e => setMeterTriggerData(prev => ({
                                      ...prev,
                                      interval_value: e.target.value
                                    }))} 
                                    disabled={!isFieldsEditable}
                                    placeholder="0"
                                    className={`w-full h-9 px-3 text-sm border rounded-md transition-colors ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background hover:border-muted-foreground/50 focus:border-primary'}`}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-foreground">Unit</label>
                                  <select 
                                    value={meterTriggerData.interval_unit} 
                                    onChange={e => setMeterTriggerData(prev => ({
                                      ...prev,
                                      interval_unit: e.target.value
                                    }))} 
                                    disabled={!isFieldsEditable}
                                    className={`w-full h-9 px-3 text-sm border rounded-md transition-colors ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background hover:border-muted-foreground/50 focus:border-primary'}`}
                                  >
                                    <option value="hours">Hours</option>
                                    <option value="km">Kilometers</option>
                                    <option value="miles">Miles</option>
                                    <option value="cycles">Cycles</option>
                                    <option value="days">Days</option>
                                    <option value="weeks">Weeks</option>
                                    <option value="months">Months</option>
                                  </select>
                                </div>
                              </div>

                              {/* Starting Value and Lead Time */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-foreground">Starting Value</label>
                                  <input 
                                    type="number" 
                                    value={meterTriggerData.start_threshold_value} 
                                    onChange={e => setMeterTriggerData(prev => ({
                                      ...prev,
                                      start_threshold_value: e.target.value
                                    }))} 
                                    disabled={!isFieldsEditable}
                                    placeholder="0"
                                    className={`w-full h-9 px-3 text-sm border rounded-md transition-colors ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background hover:border-muted-foreground/50 focus:border-primary'}`}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-foreground">Lead Time</label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number" 
                                      value={meterTriggerData.lead_time_value} 
                                      onChange={e => setMeterTriggerData(prev => ({
                                        ...prev,
                                        lead_time_value: e.target.value
                                      }))} 
                                      disabled={!isFieldsEditable}
                                      placeholder="0"
                                      className={`flex-1 h-9 px-3 text-sm border rounded-md transition-colors ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background hover:border-muted-foreground/50 focus:border-primary'}`}
                                    />
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">units before</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Toggle */}
                              <div className="pt-2">
                                <Button 
                                  className={`w-full h-10 text-sm font-medium transition-colors ${meterTriggerData.is_active ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`} 
                                  onClick={() => isFieldsEditable && setMeterTriggerData(prev => ({
                                    ...prev,
                                    is_active: !prev.is_active
                                  }))}
                                  disabled={!isFieldsEditable}
                                >
                                  {meterTriggerData.is_active ? '✓ Active Trigger' : '✗ Inactive Trigger'}
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                             <Button 
                               className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-white" 
                               onClick={async () => {
                                 if (!isFieldsEditable) {
                                   setIsFieldsEditable(true);
                                   return;
                                 }
                                 
                                  const submissionData = {
                                    name: meterTriggerData.name,
                                    interval_value: meterTriggerData.interval_value,
                                    interval_unit: meterTriggerData.interval_unit,
                                    start_threshold_value: meterTriggerData.start_threshold_value,
                                    start_threshold_unit: meterTriggerData.interval_unit,
                                    lead_time_value: meterTriggerData.lead_time_value,
                                    lead_time_unit: meterTriggerData.interval_unit,
                                    next_iteration: meterTriggerData.next_iteration,
                                    is_active: meterTriggerData.is_active,
                                    asset: id
                                  };
                                 try {
                                   if (isEditMode && selectedItemId) {
                                     await apiCall(`/pm-automation/pm-settings/${selectedItemId}`, {
                                       method: 'PUT',
                                       body: submissionData
                                     });
                                     toast({
                                       title: "Success",
                                       description: "PM Trigger settings updated successfully!"
                                     });
                                   } else {
                                     await apiCall('/pm-automation/pm-settings', {
                                       method: 'POST',
                                       body: submissionData
                                     });
                                     toast({
                                       title: "Success",
                                       description: "PM Trigger settings created successfully!"
                                     });
                                   }
                                   setIsFieldsEditable(false);
                                   fetchPmTriggers();
                                 } catch (error) {
                                   toast({
                                     title: "Error",
                                     description: "Failed to save PM Trigger settings",
                                     variant: "destructive"
                                   });
                                 }
                               }}
                             >
                               {isFieldsEditable ? (isEditMode ? 'Update' : 'Save') : 'Edit'}
                             </Button>
                          </div>
                      </div>
                  </div>

                  <div className="flex-1 ml-4">
                      <div className="px-8 pt-4 pb-8 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b before:from-primary/60 before:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                        <div className="flex items-center justify-center gap-4 mb-2 py-1 -mx-2 mt-0 bg-accent/20 border border-accent/30 rounded-md">
                          <h5 className="text-xs font-medium text-primary dark:text-secondary">Scheduled Maintenance</h5>
                        </div>
                        <div className="flex-grow overflow-auto">
                          <ApiTable 
                            endpoint="/work-order/work-orders"
                            queryParams={{ asset: id }}
                            columns={[
                              { key: 'id', label: 'WO ID', sortable: true },
                              { key: 'title', label: 'Title', sortable: true },
                              { key: 'status', label: 'Status', sortable: true },
                              { key: 'created_at', label: 'Created', sortable: true, render: (value: string) => new Date(value).toLocaleDateString() },
                              { key: 'updated_at', label: 'Updated', sortable: true, render: (value: string) => new Date(value).toLocaleDateString() }
                            ]}
                            enableSearch={true}
                            enableFiltering={true}
                            pageSize={10}
                            className="text-xs"
                            editRoutePattern="/workorders/edit/{id}"
                          />
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button 
                            className="flex-1 h-8 text-xs bg-green-500 hover:bg-green-600 text-white" 
                            onClick={() => setIsBacklogDialogOpen(true)}
                          >
                            + Add to Backlog
                          </Button>
                          <Button 
                            className="h-8 px-4 text-sm bg-blue-500 hover:bg-blue-600 text-white" 
                            onClick={generateWorkOrder}
                          >
                            Generate WO Now
                          </Button>
                        </div>
                      </div>
                  </div>
                </div>
              )}

              {currentView === 1 && (
                <div className="h-full relative animate-fade-in">
                  <button onClick={() => handleViewChange(0)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <ChevronLeft className="w-4 h-4 text-primary" />
                  </button>
                  <div className="h-full">
                     <div className="pt-4 px-8 pb-8 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b before:from-primary/60 before:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                        <div className="flex items-center justify-center gap-4 mb-2 py-1 -mx-2 mt-0 bg-accent/20 border border-accent/30 rounded-md">
                          <h5 className="text-xs font-medium text-primary dark:text-secondary">Log</h5>
                        </div>
                        <div className="flex-grow overflow-auto">
                          <PMChecklistTabs 
                            assetId={id || ''} 
                            selectedPmId={selectedItemId}
                            onNavigateBack={() => handleViewChange(0)}
                          />
                       </div>
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
                Files content coming soon...
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="backlog" className="tab-content-container">
            <div className="tab-content-generic">
              <div className="mb-4">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex items-center gap-2 px-3 py-1" 
                  onClick={() => setIsBacklogDialogOpen(true)}
                >
                  <Plus className="h-3 w-3" />
                  Add Backlog Item
                </Button>
              </div>
              <ApiTable 
                endpoint={`/asset-backlogs/asset_backlog?asset=${id}`}
                columns={[
                  { key: 'name', header: 'Name' }
                ]}
                queryKey={['asset-backlogs', id]}
                emptyMessage="No backlog items found"
                className="w-full"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="components" className="tab-content-container">
            <div className="tab-content-generic">
              <div className="p-4 text-center text-muted-foreground">
                Components content coming soon...
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="log" className="tab-content-container">
            <div className="tab-content-generic space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Active Work Orders</h3>
                <div className="max-h-[280px] overflow-auto border rounded-md">
                   <ApiTable
                     endpoint={`/work-orders/work_order?asset=${id}&status__control__name__in=Active,Draft,Pending`}
                     columns={[
                       { key: 'code', header: 'Code', type: 'string' },
                       { key: 'description', header: 'Description', type: 'string' },
                       { key: 'status', header: 'Status', type: 'object', render: (value: any) => value?.control?.name || value?.name || '-' },
                       { key: 'maint_type', header: 'Maint Type', type: 'string' },
                       { key: 'completion_end_date', header: 'Completion Date', type: 'string' }
                     ]}
                     queryKey={['active-work-orders', id]}
                     tableId={`active-work-orders-${id}`}
                     editRoutePattern="/workorders/edit/{id}"
                   />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Completed Work Orders</h3>
                <div className="max-h-[280px] overflow-auto border rounded-md">
                   <ApiTable
                     endpoint={`/work-orders/work_order?asset=${id}&status__control__name=Closed`}
                     columns={[
                       { key: 'code', header: 'Code', type: 'string' },
                       { key: 'description', header: 'Description', type: 'string' },
                       { key: 'status', header: 'Status', type: 'object', render: (value: any) => value?.control?.name || value?.name || '-' },
                       { key: 'maint_type', header: 'Maint Type', type: 'string' },
                       { key: 'completion_end_date', header: 'Completion Date', type: 'string' }
                     ]}
                     queryKey={['completed-work-orders', id]}
                     tableId={`completed-work-orders-${id}`}
                     editRoutePattern="/workorders/edit/{id}"
                   />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Asset Move History</h3>
                <div className="max-h-[280px] overflow-auto border rounded-md">
                  <ApiTable
                    endpoint={`/assets/movement-log?asset=${id}`}
                    columns={[
                      { key: 'from_location', header: 'From Location', type: 'object' },
                      { key: 'to_location', header: 'To Location', type: 'object' },
                      { key: 'moved_by', header: 'Moved By', type: 'object' },
                      { key: 'timestamp', header: 'Moved At', type: 'date' }
                    ]}
                    queryKey={['asset-movement-log', id]}
                    tableId={`asset-movement-log-${id}`}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>

      {/* Backlog Item Creation Dialog */}
      <Dialog open={isBacklogDialogOpen} onOpenChange={setIsBacklogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Backlog Item</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={[
              {
                name: 'asset',
                label: 'Asset',
                type: 'input',
                inputType: 'hidden'
              },
              {
                name: 'name',
                label: 'Name',
                type: 'input',
                inputType: 'text',
                required: true
              }
            ]}
            initialData={{
              asset: id,
              name: ''
            }}
            title=""
            onSubmit={async (data) => {
              try {
                await apiCall('/asset-backlogs/asset_backlog', {
                  method: 'POST',
                  body: {
                    asset: id,
                    name: data.name
                  }
                });
                
                toast({
                  title: "Success",
                  description: "Backlog item created successfully"
                });
                
                // Refresh the data
                queryClient.invalidateQueries({
                  queryKey: ['asset-backlogs', id]
                });
                
                setIsBacklogDialogOpen(false);
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to create backlog item",
                  variant: "destructive"
                });
              }
            }}
            submitText="Create Backlog Item"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditAsset;
