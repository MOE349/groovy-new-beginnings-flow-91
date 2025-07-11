import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import ApiTable from "@/components/ApiTable";
import { apiPost, apiDelete } from "@/utils/apis";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssetData } from "@/hooks/useAssetData";
import { useAssetSubmit } from "@/hooks/useAssetSubmit";
import { equipmentFields, attachmentFields } from "@/data/assetFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AssetFormLayout from "@/components/AssetFormLayout";
import { AttachmentFormLayout } from "@/components/AttachmentFormLayout";
import { apiGet } from "@/utils/apis";
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
  const { assetType, assetData, isLoading, isError, error } = useAssetData(id);
  const { handleSubmit } = useAssetSubmit(id, assetType);

  const handleDeleteMeterReading = async (readingId: string) => {
    try {
      await apiDelete(`/meter-readings/meter_reading/${readingId}`);
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
      await apiDelete(`/codes/code/${codeId}`);
      queryClient.invalidateQueries({ queryKey: [`/codes/code?asset=${id}`] });
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

  const customLayout = assetType === "attachment" ? AttachmentFormLayout : (props: any) => (
    <AssetFormLayout 
      {...props} 
      assetType={assetType}
      assetTypeName={assetTypeName}
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
        <Tabs defaultValue="parts-bom" className="h-full">
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
                      endpoint={`/codes/code?asset=${id}`}
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
                          await apiPost("/meter-readings/meter_reading", submissionData);
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
                          await apiPost("/codes/code", submissionData);
                          queryClient.invalidateQueries({ queryKey: [`/codes/code?asset=${id}`] });
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
            <div className="bg-card rounded-sm shadow-xs p-2 h-full min-h-[500px]">
              <div className="flex gap-4 h-full">
                {/* Left side - Settings (half width) */}
                <div className="w-1/2">
                  <div className="p-10 space-y-4 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                    <div className="flex items-center gap-4 mb-6 py-1 -mx-2 bg-accent/20 border border-accent/30 rounded-md">
                      <h4 className="text-h3 font-medium text-primary dark:text-secondary ml-6">Settings</h4>
                    </div>
                    
                    <Tabs defaultValue="meter-reading-trigger" className="w-full bg-card/50 border border-border/30 rounded-lg p-8 shadow-md">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="meter-reading-trigger">meter reading trigger</TabsTrigger>
                        <TabsTrigger value="time-trigger">time trigger</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="meter-reading-trigger" className="mt-6">
                        <div className="space-y-4">
                          {/* Every field */}
                          <div className="flex items-start gap-2 h-12">
                            <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-3">Every</label>
                            <div className="flex items-center gap-2 flex-grow">
                              <input
                                type="number"
                                defaultValue="500"
                                className="w-20 px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                              />
                              <select className="px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background">
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
                          <div className="flex items-start gap-2 h-12">
                            <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-3">Starting at</label>
                            <div className="flex-grow">
                              <input
                                type="number"
                                defaultValue="250"
                                className="w-20 px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                              />
                            </div>
                          </div>
                          
                          {/* Create WO field */}
                          <div className="flex items-start gap-2 h-12">
                            <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-3">Create WO</label>
                            <div className="flex items-center gap-2 flex-grow">
                              <input
                                type="number"
                                defaultValue="50"
                                className="w-16 px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                              />
                              <span className="text-sm text-muted-foreground">before trigger</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end pt-6">
                            <Button size="sm">
                              Save Settings
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="time-trigger" className="mt-6">
                        <div className="space-y-4">
                          {/* Time-based trigger fields */}
                          <div className="flex items-start gap-2 h-12">
                            <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-3">Frequency</label>
                            <div className="flex-grow">
                              <select className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="annually">Annually</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2 h-12">
                            <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-3">Start Date</label>
                            <div className="flex-grow">
                              <input
                                type="date"
                                className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2 h-12">
                            <label className="text-caption font-normal text-right w-20 text-foreground shrink-0 pt-3">Create WO</label>
                            <div className="flex items-center gap-2 flex-grow">
                              <input
                                type="number"
                                defaultValue="1"
                                className="w-16 px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                              />
                              <span className="text-sm text-muted-foreground">days before due</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end pt-6">
                            <Button size="sm">
                              Save Settings
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
                
                {/* Right side - Reserved for future content */}
                <div className="w-1/2">
                  <div className="p-10 space-y-4 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                    <div className="flex items-center gap-4 mb-6 py-1 -mx-2 bg-accent/20 border border-accent/30 rounded-md">
                      <h4 className="text-h3 font-medium text-primary dark:text-secondary ml-6">Additional Settings</h4>
                    </div>
                    <p className="text-caption text-muted-foreground text-center pt-12">
                      Additional configuration options will be added here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="financials" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Financials</h3>
              <p className="text-caption text-muted-foreground">Financial information content will go here</p>
            </div>
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