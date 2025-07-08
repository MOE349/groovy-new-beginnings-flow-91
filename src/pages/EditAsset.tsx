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
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-background">
        <Button 
          variant="outline" 
          onClick={() => navigate("/assets")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="px-8"
        >
          {loading ? "Loading..." : "Save"}
        </Button>
      </div>
      
      {/* Asset Information Box */}
      <div className="border rounded-lg p-4 overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">{assetTypeName} Information</h2>
          </div>
        <div className="grid grid-cols-6 gap-6">
          {/* Left side - Online toggle and photo placeholder */}
          <div className="col-span-1 space-y-4">
            {renderField({ name: "is_online", type: "switch", label: "Online", description: "Toggle between Online/Offline status" })}
            <div className="w-full h-40 bg-red-500 rounded border"></div>
            {renderField({ name: "location", type: "dropdown", label: "Location", required: true, endpoint: "/company/location", queryKey: ["company_location"], optionValueKey: "id", optionLabelKey: "name" })}
          </div>
          
          {/* Middle - Code, Asset name, Description */}
          <div className="col-span-2 space-y-3">
            {renderField({ name: "code", type: "input", label: "Code", required: true, inputType: "text" })}
            {renderField({ name: "name", type: "input", label: `${assetTypeName} Name`, required: true, inputType: "text" })}
            {renderField({ name: "description", type: "textarea", label: "Description", rows: 4 })}
            {assetType === "attachment" && renderField({ name: "equipment", type: "dropdown", label: "Equipment", endpoint: "/assets/equipments", queryKey: ["assets_equipments"], optionValueKey: "id", optionLabelKey: "name" })}
          </div>
          
          {/* Right side - Category, Make, Model, Serial Number */}
          <div className="col-span-3 space-y-3">
            {renderField({ 
              name: "category", 
              type: "dropdown", 
              label: "Category", 
              required: true, 
              endpoint: assetType === "equipment" ? "/assets/equipment_category" : "/assets/attachment_category",
              queryKey: assetType === "equipment" ? ["equipment_category"] : ["attachment_category"],
              optionValueKey: "id", 
              optionLabelKey: "name" 
            })}
            {renderField({ name: "make", type: "input", label: "Make", required: true, inputType: "text" })}
            {renderField({ name: "model", type: "input", label: "Model", required: true, inputType: "text" })}
            {renderField({ name: "serial_number", type: "input", label: "Serial Number", required: true, inputType: "text" })}
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

      {/* Tabs Section */}
      <div className="flex-1">
        <Tabs defaultValue="parts-bom" className="h-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="parts-bom">Parts/BOM</TabsTrigger>
            <TabsTrigger value="metering-events">Metering/Events</TabsTrigger>
            <TabsTrigger value="scheduled-maintenance">Scheduled Maintenance</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="log">Log</TabsTrigger>
          </TabsList>
          <TabsContent value="parts-bom" className="h-full mt-4">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Parts/BOM</h3>
              <p>Parts and Bill of Materials content will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="metering-events" className="h-full mt-4">
            <div className="border rounded-lg p-6 h-full flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Metering/Events</h3>
                
                {/* Add Meter Reading Form - Horizontal Layout */}
                <div className="flex items-end gap-4 mb-6">
                  <div className="w-80">
                    <label className="block text-sm font-medium mb-2">
                      Meter Reading <span className="text-red-500">*</span>
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
                        <div className="flex items-center gap-4">
                          <div className="w-60">
                            {renderField({ 
                              name: "meter_reading", 
                              type: "input", 
                              inputType: "text", 
                              required: true 
                            })}
                          </div>
                          <Button onClick={handleSubmit} className="px-8">
                            Save
                          </Button>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Meter Readings Table */}
              <div className="flex-1">
                <ApiTable
                  endpoint={`/meter-readings/meter_reading?asset=${id}`}
                  queryKey={["meter_readings", id]}
                  columns={[
                    { key: 'meter_reading', header: 'Meter Reading', type: 'string' },
                    { key: 'created_at', header: 'Creation Date', type: 'date' },
                    { key: 'created_by', header: 'Created By', type: 'object' },
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
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ),
                      className: "w-12"
                    },
                  ]}
                  emptyMessage="No meter readings found"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="scheduled-maintenance" className="h-full mt-4">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Scheduled Maintenance</h3>
              <p>Scheduled maintenance content will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="financials" className="h-full mt-4">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Financials</h3>
              <p>Financial information content will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="log" className="h-full mt-4">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Log</h3>
              <p>Activity log content will go here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditAsset;