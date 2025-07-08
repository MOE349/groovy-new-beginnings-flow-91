import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import ApiTable from "@/components/ApiTable";
import { apiPost } from "@/utils/apis";
import { equipmentFields } from "@/data/assetFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CreateEquipment = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiPost("/assets/equipments", data);
      toast({
        title: "Success",
        description: "Equipment created successfully!",
      });
      navigate("/assets");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create equipment",
        variant: "destructive",
      });
    }
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
      
      {/* Equipment Information Box */}
      <div className="border rounded-lg p-4 overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Equipment Information</h2>
          </div>
        <div className="grid grid-cols-6 gap-6">
          {/* Left side - Online toggle and photo placeholder */}
          <div className="col-span-1 space-y-4">
            {renderField({ name: "is_online", type: "switch", label: "Online", description: "Toggle between Online/Offline status" })}
            <div className="w-full h-40 bg-red-500 rounded border"></div>
            {renderField({ name: "location", type: "dropdown", label: "Location", required: true, endpoint: "/company/location", queryKey: ["company_location"], optionValueKey: "id", optionLabelKey: "name" })}
          </div>
          
          {/* Middle - Code, Equipment name, Description */}
          <div className="col-span-2 space-y-3">
            {renderField({ name: "code", type: "input", label: "Code", required: true, inputType: "text" })}
            {renderField({ name: "name", type: "input", label: "Equipment Name", required: true, inputType: "text" })}
            {renderField({ name: "description", type: "textarea", label: "Description", rows: 4 })}
          </div>
          
          {/* Right side - Category, Make, Model, Serial Number */}
          <div className="col-span-3 space-y-3">
            {renderField({ name: "category", type: "dropdown", label: "Category", required: true, endpoint: "/assets/equipment_category", queryKey: ["equipment_category"], optionValueKey: "id", optionLabelKey: "name" })}
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
          fields={equipmentFields}
          onSubmit={handleSubmit}
          initialData={{
            is_online: false,
          }}
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
            <div className="border rounded-lg p-4 h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <h3 className="text-lg font-semibold mb-2">Metering/Events</h3>
                <p>Create the equipment first, then add meter readings in the edit view.</p>
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

export default CreateEquipment;