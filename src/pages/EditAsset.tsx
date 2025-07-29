import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Camera, ChevronRight, ChevronLeft, Edit2, Trash2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import ApiInput from "@/components/ApiInput";
import ApiTable from "@/components/ApiTable";
import LocationEquipmentDropdown from "@/components/LocationEquipmentDropdown";
import TenMilLogo from "@/components/TenMilLogo";
import GearSpinner from "@/components/ui/gear-spinner";
import { siteFormFields } from "@/data/siteFormFields";
import { equipmentFields, attachmentFields } from "@/data/assetFormFields";
import { useAssetData } from "@/hooks/useAssetData";
import { useAssetSubmit } from "@/hooks/useAssetSubmit";
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
  console.log("EditAsset component started");
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prefetchFinancialData = usePrefetchFinancialData();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isBacklogDialogOpen, setIsBacklogDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState(0);
  const [activeTab, setActiveTab] = useState("metering-events");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFieldsEditable, setIsFieldsEditable] = useState(false);
  const [meterTriggerData, setMeterTriggerData] = useState({
    name: '',
    interval_value: '',
    interval_unit: 'hours',
    start_threshold_value: '',
    lead_time_value: '',
    next_iteration: 0,
    is_active: false
  });

  const { toast } = useToast();
  
  const { assetType, assetData, error, isLoading, isError } = useAssetData(id);
  const { handleSubmit: submitHandler } = useAssetSubmit(id, assetType);

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

  const handleViewChange = (view: number) => {
    setCurrentView(view);
  };

  const currentAssetType = assetType || assetData?.asset_type;
  const currentAttachmentFields = attachmentFields || [];
  const currentEquipmentFields = equipmentFields || [];

  const handleSubmit = async (data: any) => {
    console.log("Submitting:", data);
    await submitHandler(data);
  };

  useEffect(() => {
    if (activeTab === "financials" && id) {
      prefetchFinancialData(id);
    }
  }, [activeTab, id, prefetchFinancialData]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "financials" && id) {
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

  if (!currentAssetType || !assetData) {
    return <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>;
  }

  const currentFields = currentAssetType === "equipment" ? currentEquipmentFields : currentAttachmentFields;
  const assetTypeName = currentAssetType === "equipment" ? "Equipment" : "Attachment";

  const initialData = {
    name: assetData?.name || "",
    description: assetData?.description || "",
    manufacturer: assetData?.manufacturer?.id || assetData?.manufacturer || "",
    model: assetData?.model || "",
    year: assetData?.year || "",
    serial_number: assetData?.serial_number || "",
    category: assetData?.category?.id || assetData?.category || "",
    location: assetData?.location?.id || assetData?.location || "",
    site: assetData?.site?.id || assetData?.site || "",
    job_code: assetData?.job_code?.id || assetData?.job_code || "",
    asset_status: assetData?.asset_status?.id || assetData?.asset_status || ""
  };

  const customLayout = (props: any) => <FormLayout {...props} config={currentAssetType === "attachment" ? attachmentFormConfig : equipmentFormConfig} />;

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
                onClick={() => handleTabChange("financials")}
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
              <div className="flex gap-4 h-full">
                <div className="w-1/3">
                  <div className="px-8 pt-4 pb-8 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b before:from-primary/60 before:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                    <div className="flex items-center justify-center gap-4 mb-2 py-1 -mx-2 mt-0 bg-accent/20 border border-accent/30 rounded-md">
                      <h5 className="text-xs font-medium text-primary dark:text-secondary">QR Codes</h5>
                    </div>
                    <div className="flex-grow overflow-auto">
                      <ApiTable 
                        endpoint="/asset-qr-codes/asset_qr_code"
                        filters={{ asset: id }}
                        columns={[
                          { key: 'qr_code', header: 'QR Code' },
                          { key: 'created_at', header: 'Created At', render: (value: any) => value ? new Date(value).toLocaleDateString() : '-' },
                          { key: 'created_by', header: 'Created By', render: (value: any) => {
                            if (typeof value === 'object' && value) {
                              return value.name || value.email || value.id || '-';
                            }
                            return value || '-';
                          }},
                          { key: 'actions', header: '', render: (value: any, row: any) => (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setIsCodeDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Camera className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        ]}
                        className="text-xs"
                        tableId={`qr-codes-${id}`}
                      />
                    </div>
                    <div className="mt-4">
                      <Button 
                        className="w-full h-8 text-xs bg-blue-500 hover:bg-blue-600 text-white" 
                        onClick={() => setIsCodeDialogOpen(true)}
                      >
                        + Generate QR Code
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="px-8 pt-4 pb-8 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b before:from-primary/60 before:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
                    <div className="flex items-center justify-center gap-4 mb-2 py-1 -mx-2 mt-0 bg-accent/20 border border-accent/30 rounded-md">
                      <h5 className="text-xs font-medium text-primary dark:text-secondary">Meter Reading Events</h5>
                    </div>
                    <div className="flex-grow overflow-auto">
                      <ApiTable 
                        endpoint="/asset-meter-readings/asset_meter_reading"
                        filters={{ asset: id }}
                        columns={[
                          { key: 'timestamp', header: 'Timestamp', render: (value: any) => value ? new Date(value).toLocaleDateString() : '-' },
                          { key: 'meter_reading', header: 'Reading' },
                          { key: 'created_at', header: 'Created At', render: (value: any) => value ? new Date(value).toLocaleDateString() : '-' },
                          { key: 'created_by', header: 'Created By', render: (value: any) => {
                            if (typeof value === 'object' && value) {
                              return value.name || value.email || value.id || '-';
                            }
                            return value || '-';
                          }}
                        ]}
                        className="text-xs"
                        tableId={`codes-${id}`}
                      />
                    </div>
                    <div className="mt-4">
                      <Button 
                        className="w-full h-8 text-xs bg-green-500 hover:bg-green-600 text-white" 
                        onClick={() => setIsDialogOpen(true)}
                      >
                        + Add Meter Reading
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Meter Reading</DialogTitle>
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
                        name: 'meter_reading',
                        label: 'Meter Reading',
                        type: 'input',
                        inputType: 'number',
                        required: true
                      },
                      {
                        name: 'timestamp',
                        label: 'Timestamp',
                        type: 'datepicker',
                        required: true
                      }
                    ]}
                    initialData={{
                      asset: id,
                      meter_reading: '',
                      timestamp: new Date().toISOString().split('T')[0]
                    }}
                    title=""
                    onSubmit={async (data) => {
                      try {
                        await apiCall('/asset-meter-readings/asset_meter_reading', {
                          method: 'POST',
                          body: {
                            asset: id,
                            meter_reading: data.meter_reading,
                            timestamp: data.timestamp
                          }
                        });
                        
                        toast({
                          title: "Success",
                          description: "Meter reading added successfully"
                        });
                        
                        queryClient.invalidateQueries({
                          queryKey: [`/asset-meter-readings/asset_meter_reading?asset=${id}`]
                        });
                        
                        setIsDialogOpen(false);
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to add meter reading",
                          variant: "destructive"
                        });
                      }
                    }}
                    submitText="Add Reading"
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate QR Code</DialogTitle>
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
                        name: 'qr_code',
                        label: 'QR Code Value',
                        type: 'input',
                        inputType: 'text',
                        required: true
                      }
                    ]}
                    initialData={{
                      asset: id,
                      qr_code: ''
                    }}
                    title=""
                    onSubmit={async (data) => {
                      try {
                        await apiCall('/asset-qr-codes/asset_qr_code', {
                          method: 'POST',
                          body: {
                            asset: id,
                            qr_code: data.qr_code
                          }
                        });
                        
                        toast({
                          title: "Success",
                          description: "QR Code generated successfully"
                        });
                        
                        queryClient.invalidateQueries({
                          queryKey: [`/asset-qr-codes/asset_qr_code?asset=${id}`]
                        });
                        
                        setIsCodeDialogOpen(false);
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to generate QR code",
                          variant: "destructive"
                        });
                      }
                    }}
                    submitText="Generate QR Code"
                  />
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
                     <div className="px-4 pt-4 pb-0 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b before:from-primary/60 before:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
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
                            columns={[
                              { key: 'id', header: 'WO ID' },
                              { key: 'title', header: 'Title' },
                              { key: 'status', header: 'Status' },
                              { key: 'created_at', header: 'Created', render: (value: string) => new Date(value).toLocaleDateString() },
                              { key: 'updated_at', header: 'Updated', render: (value: string) => new Date(value).toLocaleDateString() }
                            ]}
                            filters={{ asset: id }}
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
              <div className="overflow-auto">
                <ApiTable 
                  endpoint="/asset-backlogs/asset_backlog"
                  filters={{ asset: id }}
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'created_at', header: 'Created At', render: (value: any) => value ? new Date(value).toLocaleDateString() : '-' }
                  ]}
                  className="text-xs"
                  tableId={`backlog-${id}`}
                />
              </div>
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
              <div className="overflow-auto">
                <h3 className="text-lg font-semibold mb-4">Asset Movement Log</h3>
                <ApiTable 
                  endpoint="/asset-logs/asset_log"
                  filters={{ asset: id }}
                  columns={[
                    { key: 'old_location', header: 'From Location', render: (value: any) => typeof value === 'object' ? value?.name || '-' : value || '-' },
                    { key: 'new_location', header: 'To Location', render: (value: any) => typeof value === 'object' ? value?.name || '-' : value || '-' },
                    { key: 'moved_by', header: 'Moved By', render: (value: any) => typeof value === 'object' ? value?.name || value?.email || '-' : value || '-' },
                    { key: 'timestamp', header: 'Moved At', render: (value: any) => value ? new Date(value).toLocaleDateString() : '-' }
                  ]}
                  queryKey={['asset-movement-log', id]}
                  tableId={`asset-movement-log-${id}`}
                />
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
