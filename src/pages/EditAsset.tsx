import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
            <div className="bg-card rounded-sm shadow-xs p-4 h-[500px] overflow-auto">
              <div className="p-4 text-center text-muted-foreground">
                Schedule maintenance content coming soon...
              </div>
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
              <ApiTable
                endpoint={`/workorders/workorder?status__in=Pending%2CNew&asset=${id}`}
                columns={[
                  { key: 'code', header: 'Code' },
                  { key: 'title', header: 'Title' },
                  { 
                    key: 'status', 
                    header: 'Status',
                    render: (value: any) => {
                      const statusColors = {
                        'New': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                        'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                        'InProgress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                        'Complete': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                        'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      };
                      const colorClass = statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                          {value}
                        </span>
                      );
                    }
                  },
                  { 
                    key: 'created_at', 
                    header: 'Created',
                    render: (value: any) => value ? new Date(value).toLocaleDateString() : '-'
                  },
                ]}
                queryKey={["workorder", `backlog-${id}`]}
                editRoutePattern="/workorders/edit/{id}"
                tableId={`backlog-${id}`}
              />
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