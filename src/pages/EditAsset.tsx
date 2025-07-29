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
              {currentView === 0 && <div className="flex gap-4 h-full relative animate-fade-in">
                  <button onClick={() => handleViewChange(1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </button>
                  <div className="w-1/4">
                     <div className="px-4 pt-4 pb-0 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                        <div className="flex items-center justify-center gap-4 mb-2 py-1 -mx-2 mt-0 bg-accent/20 border border-accent/30 rounded-md">
                          <h5 className="text-xs font-medium text-primary dark:text-secondary">Meter Reading Trigger</h5>
                        </div>
                        <div className="mb-4">
                          <div className="overflow-auto h-[120px]">
                            <table className="w-full caption-bottom text-sm">
                              <thead>
                                 <tr className="border-b">
                                   <th className="h-6 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs w-8"></th>
                                   <th className="h-6 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">Name</th>
                                   <th className="h-6 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">Next Trigger</th>
                                   <th className="h-6 px-2 py-1 text-left align-middle font-medium text-primary-foreground bg-primary text-xs">Status</th>
                                 </tr>
                              </thead>
                               <tbody>
                                 {(() => {
                                   const rows = [];
                                   for (let i = 0; i < 3; i++) {
                                     const item = pmSettingsData?.[i];
                                     rows.push(
                                          <tr 
                                            key={i} 
                                            className="border-b cursor-pointer hover:bg-muted/50"
                                            onClick={() => {
                                              setSelectedRadioId(item?.id || i.toString());
                                              if (item) {
                                                 setMeterTriggerData({
                                                   name: item.name ?? "",
                                                   interval_value: String(item.interval_value ?? ""),
                                                   interval_unit: item.interval_unit ?? "hours",
                                                   start_threshold_value: String(item.start_threshold_value ?? ""),
                                                   lead_time_value: String(item.lead_time_value ?? ""),
                                                   next_iteration: item.next_iteration ?? "",
                                                   is_active: item.is_active !== undefined ? item.is_active : true
                                                 });
                                                setIsEditMode(true);
                                                setSelectedItemId(item.id);
                                                setIsFieldsEditable(false);
                                              } else {
                                                 setMeterTriggerData({
                                                   name: "",
                                                   interval_value: "",
                                                   interval_unit: "hours",
                                                   start_threshold_value: "",
                                                   lead_time_value: "",
                                                   next_iteration: "",
                                                   is_active: true
                                                 });
                                                setIsEditMode(false);
                                                setSelectedItemId(null);
                                                setIsFieldsEditable(true);
                                              }
                                            }}
                                          >
                                           <td className="px-2 py-1 text-left align-middle text-xs">
                                              <input 
                                                type="radio" 
                                                name="pm-selection" 
                                                value={item?.id || i} 
                                                checked={selectedRadioId === (item?.id || i.toString())}
                                                onChange={() => {}} // Row click handler manages the selection
                                                className="w-3 h-3 pointer-events-none appearance-none border-2 border-muted-foreground/30 bg-background rounded-md checked:bg-primary checked:border-primary transition-all duration-200 relative checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:text-primary-foreground checked:after:text-[10px] checked:after:font-bold checked:after:flex checked:after:items-center checked:after:justify-center checked:after:leading-none"
                                              />
                                           </td>
                                          <td className="px-2 py-1 text-left align-middle text-xs">
                                            {item?.name || '-'}
                                          </td>
                                          <td className="px-2 py-1 text-left align-middle text-xs">
                                            {item?.next_trigger_value || '-'}
                                          </td>
                                          <td className="px-2 py-1 text-left align-middle text-xs">
                                            {item?.is_active ? 'Active' : item?.is_active === false ? 'Inactive' : '-'}
                                          </td>
                                        </tr>
                                     );
                                   }
                                   return rows;
                                 })()}
                               </tbody>
                             </table>
                           </div>
                            <div className="px-2 pb-2 flex items-center gap-4 mt-8">
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="text-secondary py-1 px-3 text-sm"
                                disabled={!selectedItemId}
                                onClick={async () => {
                                  if (!selectedItemId) return;
                                  try {
                                    await apiCall(`/pm-automation/pm-settings/manual-generation/${selectedItemId}`, {
                                      method: 'POST'
                                    });
                                    toast({
                                      title: "Success",
                                      description: "Work order generated successfully!"
                                    });
                                  } catch (error: any) {
                                    toast({
                                      title: "Error",
                                      description: error.message || "Failed to generate work order",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                Generate WO Now
                              </Button>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Next Iteration</span>
                                {selectedItemId ? (
                                  <div className="next-iteration-dropdown">
                                    <ApiDropDown
                                      name="next_iteration"
                                      value={meterTriggerData.next_iteration}
                                      onChange={(value) => setMeterTriggerData(prev => ({
                                        ...prev,
                                        next_iteration: value
                                      }))}
                                      endpoint={`/pm-automation/pm-settings/manual-generation/${selectedItemId}`}
                                      optionValueKey="id"
                                      optionLabelKey="name"
                                      placeholder="Select iteration"
                                      disabled={!isFieldsEditable}
                                      className="w-40 [&>button]:h-7 [&>button]:text-xs [&>button]:px-2 [&>button]:py-0 [&>button]:min-h-0 [&>button]:border-input [&>button]:bg-background [&>button]:hover:bg-accent [&>button]:focus:bg-accent [&>button]:rounded-sm [&>button]:shadow-sm [&>button]:transition-colors [&>button]:duration-150"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-40 h-7 px-2 text-xs border border-input rounded-sm flex items-center text-muted-foreground bg-muted/50 shadow-sm">
                                    No PM setting selected
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                            <div className="flex-grow overflow-auto flex flex-col justify-end pb-4">
                               <div className="space-y-1">
                                <div className="flex items-center">
                                  <span className="text-xs text-muted-foreground w-16">Name</span>
                                  <input 
                                    type="text" 
                                    value={meterTriggerData.name} 
                                    onChange={e => setMeterTriggerData(prev => ({
                                      ...prev,
                                      name: e.target.value
                                    }))} 
                                    disabled={!isFieldsEditable}
                                    className={`w-33 h-6 px-2 text-xs border rounded ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background'}`}
                                  />
                                </div>
                                <div className="flex items-center">
                                  <span className="text-xs text-muted-foreground w-16">Every</span>
                                  <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        value={meterTriggerData.interval_value} 
                                         onChange={e => setMeterTriggerData(prev => ({
                                           ...prev,
                                           interval_value: e.target.value
                                         }))} 
                                        disabled={!isFieldsEditable}
                                        className={`w-16 h-6 px-2 text-xs border rounded ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background'}`}
                                      />
                                      <select 
                                        value={meterTriggerData.interval_unit} 
                                        onChange={e => setMeterTriggerData(prev => ({
                                          ...prev,
                                          interval_unit: e.target.value
                                        }))} 
                                        disabled={!isFieldsEditable}
                                        className={`h-6 px-2 text-xs border rounded w-20 ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background'}`}
                                      >
                                       <option value="hours">hours</option>
                                       <option value="km">km</option>
                                       <option value="miles">miles</option>
                                       <option value="cycles">cycles</option>
                                       <option value="days">days</option>
                                       <option value="weeks">weeks</option>
                                       <option value="months">months</option>
                                     </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">Starting at</span>
                                      <input 
                                        type="number" 
                                        value={meterTriggerData.start_threshold_value} 
                                         onChange={e => setMeterTriggerData(prev => ({
                                           ...prev,
                                           start_threshold_value: e.target.value
                                         }))} 
                                        disabled={!isFieldsEditable}
                                        className={`w-24 h-6 px-2 text-xs border rounded ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background'}`}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-xs text-muted-foreground w-16">Create</span>
                                  <input 
                                    type="number" 
                                    value={meterTriggerData.lead_time_value} 
                                     onChange={e => setMeterTriggerData(prev => ({
                                       ...prev,
                                       lead_time_value: e.target.value
                                     }))} 
                                    disabled={!isFieldsEditable}
                                    className={`w-16 h-6 px-2 text-xs border rounded ${!isFieldsEditable ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background'}`}
                                  />
                                  <span className="text-xs text-muted-foreground ml-2">before trigger</span>
                                </div>
                              <div>
                                 <Button 
                                   className={`w-full h-8 text-xs ${meterTriggerData.is_active ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`} 
                                   onClick={() => isFieldsEditable && setMeterTriggerData(prev => ({
                                     ...prev,
                                     is_active: !prev.is_active
                                   }))}
                                   disabled={!isFieldsEditable}
                                 >
                                   {meterTriggerData.is_active ? '✓ Active' : '✗ Inactive'}
                                 </Button>
                              </div>
                            </div>
                            <div className="mt-0.5">
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
                                     setIsEditMode(false);
                                     setSelectedItemId(null);
                                     setIsFieldsEditable(false);
                                     queryClient.invalidateQueries({
                                       queryKey: [`/pm-automation/pm-settings?asset=${id}`]
                                     });
                                   } catch (error: any) {
                                     toast({
                                       title: "Error",
                                       description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} PM Trigger settings`,
                                       variant: "destructive"
                                     });
                                   }
                                 }}
                               >
                                 {!isFieldsEditable ? 'Edit' : (isEditMode ? 'Save' : 'Save')}
                               </Button>
                            </div>
                          </div>
                     </div>
                  </div>

                  <div className="w-1/4">
                     <div className="px-4 pt-4 pb-0 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                       <div className="flex items-center justify-center gap-4 mb-2 py-1 -mx-2 mt-0 bg-accent/20 border border-accent/30 rounded-md">
                         <h5 className="text-xs font-medium text-primary dark:text-secondary">Calendar Trigger</h5>
                       </div>
                          <div className="flex-grow overflow-auto flex flex-col justify-end pb-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Name</span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    value={calendarTriggerData.name} 
                                    onChange={e => setCalendarTriggerData(prev => ({
                                      ...prev,
                                      name: e.target.value
                                    }))} 
                                    className="w-33 h-6 px-2 text-xs border rounded bg-background" 
                                  />
                                </div>
                              </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Every</span>
                              <div className="flex items-center gap-2">
                                <input type="number" value={calendarTriggerData.interval_value} onChange={e => setCalendarTriggerData(prev => ({
                                ...prev,
                                interval_value: Number(e.target.value)
                              }))} className="w-16 h-6 px-2 text-xs border rounded bg-background" />
                                 <select value={calendarTriggerData.interval_unit} onChange={e => setCalendarTriggerData(prev => ({
                                 ...prev,
                                 interval_unit: e.target.value
                               }))} className="h-6 px-2 text-xs border rounded bg-background w-20">
                                  <option value="days">days</option>
                                  <option value="weeks">weeks</option>
                                  <option value="months">months</option>
                                  <option value="years">years</option>
                                </select>
                              </div>
                            </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Starting at</span>
                                   <div className="flex items-center gap-2 pr-0">
                                     <input type="date" value={calendarTriggerData.start_date} onChange={e => setCalendarTriggerData(prev => ({
                                     ...prev,
                                     start_date: e.target.value
                                   }))} className="w-16 h-6 px-2 text-xs border rounded bg-background" />
                                     <span className="text-xs text-muted-foreground w-20"></span>
                                  </div>
                              </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Create</span>
                              <div className="flex items-center gap-2">
                                <input type="number" value={calendarTriggerData.days_in_advance} onChange={e => setCalendarTriggerData(prev => ({
                                ...prev,
                                days_in_advance: Number(e.target.value)
                              }))} className="w-16 h-6 px-2 text-xs border rounded bg-background" />
                                <span className="text-xs text-muted-foreground w-20">days in advance</span>
                              </div>
                            </div>
                            <div>
                              <Button className={`w-full h-8 text-xs ${calendarTriggerData.is_active ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`} onClick={() => setCalendarTriggerData(prev => ({
                              ...prev,
                              is_active: !prev.is_active
                            }))}>
                                {calendarTriggerData.is_active ? '✓ Active' : '✗ Inactive'}
                              </Button>
                            </div>
                          </div>
                        <div className="mt-0.5">
                          <Button className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-white" onClick={handleSaveCalendarTrigger}>
                            Save
                          </Button>
                        </div>
                        </div>
                     </div>
                  </div>

                  <div className="w-1/2">
                    <div className="p-6 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                      <div className="flex items-center justify-center gap-4 mb-6 py-1 -mx-2 -mt-3 bg-accent/20 border border-accent/30 rounded-md">
                        <h4 className="text-sm font-medium text-primary dark:text-secondary">Log</h4>
                      </div>
                       <div className="flex-grow space-y-4 overflow-auto">
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
                </div>}

              {currentView === 1 && <div className="h-full relative animate-fade-in">
                  <button onClick={() => handleViewChange(0)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <ChevronLeft className="w-4 h-4 text-primary" />
                  </button>
                  <div className="h-full">
                     <div className="pt-4 px-8 pb-8 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                       <div className="absolute top-2 left-8 right-8 flex items-center justify-center gap-4 py-1 bg-accent/20 border border-accent/30 rounded-md z-10">
                         <h4 className="text-sm font-medium text-primary dark:text-secondary">PM Checklist/Parts</h4>
                       </div>
                        <div className="flex-grow overflow-auto mt-6">
                          <PMChecklistTabs 
                            assetId={id || ''} 
                            selectedPmId={selectedItemId}
                            onNavigateBack={() => handleViewChange(0)}
                          />
                       </div>
                    </div>
                  </div>
                </div>}
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
    </div>;
};

export default EditAsset;
