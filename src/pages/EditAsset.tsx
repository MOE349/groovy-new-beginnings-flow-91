import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import ApiTable from "@/components/ApiTable";
import { apiPost, apiDelete } from "@/utils/apis";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { useAssetData } from "@/hooks/useAssetData";
import { useAssetSubmit } from "@/hooks/useAssetSubmit";
import { equipmentFields, attachmentFields } from "@/data/assetFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const EditAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { assetType, assetData, isLoading, isError, error } = useAssetData(id);
  const { handleSubmit } = useAssetSubmit(id, assetType);

  const handleDeleteMeterReading = async (readingId: string) => {
    try {
      await apiDelete(`/meter-readings/meter_reading/${readingId}`);
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

  const customLayout = ({ handleSubmit, formData, handleFieldChange, loading, error, renderField }: any) => (
    <div className="space-y-0">
      {/* Top Bar - Height 3.5rem */}
      <div className="h-14 flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/assets")}
          className="flex items-center gap-2 text-foreground hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6"
        >
          {loading ? "Loading..." : "Save"}
        </Button>
      </div>
      
      {/* Equipment Information Card - Compact */}
      <div className="bg-card rounded-md shadow-sm px-2 py-1">
        <form onSubmit={handleSubmit} className="h-full">
          <h3 className="text-h3 font-medium mb-4 text-primary">{assetTypeName} Information</h3>
          
          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column - 35% - Online toggle + image + location */}
            <div className="lg:col-span-4 space-y-3 flex flex-col">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={formData?.is_online || false} 
                  onCheckedChange={(checked) => handleFieldChange("is_online", checked)}
                />
                <Label className="text-caption font-normal">Online</Label>
              </div>
              <div className="w-1/2 h-32 bg-muted rounded border overflow-hidden">
                <img 
                  src="/lovable-uploads/cf9d21df-6820-4bea-ae16-54c41a67117e.png" 
                  alt="Equipment" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 w-1/2">
                <label className="block text-caption font-normal text-right w-24 text-foreground">Location</label>
                {renderField({ 
                  name: "location", 
                  type: "dropdown", 
                  required: true, 
                  endpoint: "/company/location", 
                  queryKey: ["company_location"], 
                  optionValueKey: "id", 
                  optionLabelKey: "name"
                })}
              </div>
            </div>
            
            {/* Right Column - 65% - Two sub-columns for fields */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 w-full">
                {/* First sub-column */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Code</label>
                    <div className="flex-grow">
                      {renderField({ name: "code", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Name</label>
                    <div className="flex-grow">
                      {renderField({ name: "name", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0 pt-1">Description</label>
                    <div className="flex-grow">
                      {renderField({ name: "description", type: "textarea", rows: 2 })}
                    </div>
                  </div>
                  {assetType === "attachment" && (
                    <div className="flex items-center space-x-2">
                      <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Equipment</label>
                      <div className="flex-grow">
                        {renderField({ name: "equipment", type: "dropdown", endpoint: "/assets/equipments", queryKey: ["assets_equipments"], optionValueKey: "id", optionLabelKey: "name" })}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Second sub-column */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Category</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "category", 
                        type: "dropdown", 
                        required: true, 
                        endpoint: assetType === "equipment" ? "/assets/equipment_category" : "/assets/attachment_category",
                        queryKey: assetType === "equipment" ? ["equipment_category"] : ["attachment_category"],
                        optionValueKey: "id", 
                        optionLabelKey: "name"
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Make</label>
                    <div className="flex-grow">
                      {renderField({ name: "make", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Model</label>
                    <div className="flex-grow">
                      {renderField({ name: "model", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Serial #</label>
                    <div className="flex-grow">
                      {renderField({ name: "serial_number", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                </div>
                
                {/* Third sub-column */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Status</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "status", 
                        type: "dropdown",
                        required: true,
                        options: [
                          { id: "active", name: "Active" },
                          { id: "inactive", name: "Inactive" },
                          { id: "maintenance", name: "Under Maintenance" },
                          { id: "retired", name: "Retired" }
                        ]
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Job Code</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "job_code", 
                        type: "dropdown",
                        options: [
                          { id: "job001", name: "JOB-001" },
                          { id: "job002", name: "JOB-002" },
                          { id: "job003", name: "JOB-003" },
                          { id: "job004", name: "JOB-004" }
                        ]
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Account Code</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "account_code", 
                        type: "dropdown",
                        options: [
                          { id: "acc001", name: "ACC-001" },
                          { id: "acc002", name: "ACC-002" },
                          { id: "acc003", name: "ACC-003" },
                          { id: "acc004", name: "ACC-004" }
                        ]
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
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
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Parts/BOM
              </TabsTrigger>
              <TabsTrigger 
                value="metering-events"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Metering/Events
              </TabsTrigger>
              <TabsTrigger 
                value="scheduled-maintenance"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Scheduled Maintenance
              </TabsTrigger>
              <TabsTrigger 
                value="financials"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger 
                value="files"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Files
              </TabsTrigger>
              <TabsTrigger 
                value="backlog"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Backlog
              </TabsTrigger>
              <TabsTrigger 
                value="log"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Log
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Content Panels - Compact */}
          <TabsContent value="parts-bom" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Parts/BOM</h3>
              <p className="text-caption text-muted-foreground">Parts and Bill of Materials content will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="metering-events" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Metering/Events</h3>
              
              {/* Add Meter Reading Form - Compact */}
              <div className="flex items-end gap-4">
                <div className="w-80">
                  <label className="block text-caption font-normal mb-1 text-foreground">
                    Meter Reading <span className="text-destructive">*</span>
                  </label>
                  <ApiForm
                    fields={[
                      {
                        name: "meter_reading",
                        type: "input",
                        inputType: "text",
                        required: true
                      }
                    ]}
                    onSubmit={async (data) => {
                      const submissionData = {
                        ...data,
                        asset: id
                      };
                      try {
                        await apiPost("/meter-readings/meter_reading", submissionData);
                        queryClient.invalidateQueries({ queryKey: ["meter_readings", id] });
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
                      <div className="flex items-center gap-3">
                        <div className="w-48">
                          {renderField({ 
                            name: "meter_reading", 
                            type: "input", 
                            inputType: "text", 
                            required: true
                          })}
                        </div>
                        <Button onClick={handleSubmit} className="h-10 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                          Save
                        </Button>
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Meter Readings Table */}
              <div className="space-y-2 w-3/8">
                <ApiTable
                  endpoint={`/meter-readings/meter_reading?asset=${id}`}
                  queryKey={["meter_readings", id]}
                  columns={[
                    { key: 'meter_reading', header: 'Meter Reading', type: 'string', className: "py-1 px-2" },
                    { key: 'created_at', header: 'Creation Date', type: 'date', className: "py-1 px-2" },
                    { key: 'created_by', header: 'Created By', type: 'object', className: "py-1 px-2" },
                    { 
                      key: 'actions', 
                      header: '', 
                      render: (value: any, row: any) => (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeterReading(row.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      ),
                      className: "w-10 py-1 px-2"
                    },
                  ]}
                  emptyMessage="No meter readings found"
                  tableClassName="text-xs [&_td]:py-1 [&_td]:px-2 [&_th]:py-1 [&_th]:px-2 [&_th]:h-8"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scheduled-maintenance" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Scheduled Maintenance</h3>
              <p className="text-caption text-muted-foreground">Scheduled maintenance content will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="financials" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Financials</h3>
              <p className="text-caption text-muted-foreground">Financial information content will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="files" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Files</h3>
              <p className="text-caption text-muted-foreground">File attachments and documents will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="backlog" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Backlog</h3>
              <p className="text-caption text-muted-foreground">Backlog items and tasks will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="log" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
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