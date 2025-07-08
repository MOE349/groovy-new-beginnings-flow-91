import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { apiPost } from "@/utils/apis";
import { workOrderFields } from "@/data/workOrderFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CreateWorkOrder = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiPost("/work-orders/work_order", data);
      toast({
        title: "Success",
        description: "Work order created successfully!",
      });
      navigate("/workorders");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create work order",
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
          onClick={() => navigate("/workorders")}
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
          {loading ? "Loading..." : "Create Work Order"}
        </Button>
      </div>
      
      {/* Work Order Information Box */}
      <div className="border rounded-lg p-4 overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Work Order Information</h2>
            <div className="text-sm text-muted-foreground">
              Code: {formData?.code || "Auto-generated"}
            </div>
          </div>
          <div className="grid grid-cols-6 gap-3 h-[calc(100%-4rem)]">
            {/* Left side - Asset, Status, Description */}
            <div className="col-span-2 space-y-3">
              {renderField({ 
                name: "asset", 
                type: "dropdown", 
                label: "Asset", 
                required: true, 
                endpoint: "/assets/equipments",
                optionValueKey: "id", 
                optionLabelKey: "name" 
              })}
              {renderField({ 
                name: "status", 
                type: "dropdown", 
                label: "Status", 
                required: true, 
                endpoint: "/work-orders/status",
                optionValueKey: "id", 
                optionLabelKey: "name" 
              })}
              {renderField({ name: "description", type: "textarea", label: "Description", rows: 4 })}
            </div>
            
            {/* Middle - Type, Priority */}
            <div className="col-span-2 space-y-3">
              {renderField({ name: "maint_type", type: "input", label: "Maint Type", inputType: "text" })}
              {renderField({ name: "priority", type: "input", label: "Priority", inputType: "text" })}
            </div>
            
            {/* Right side - dates */}
            <div className="col-span-2 space-y-3">
              {renderField({ name: "suggested_start_date", type: "datepicker", label: "Suggested Start Date" })}
              {renderField({ name: "completion_end_date", type: "datepicker", label: "Completion Date" })}
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
          fields={workOrderFields}
          onSubmit={handleSubmit}
          customLayout={customLayout}
        />
      </div>

      {/* Tabs Section */}
      <div className="flex-1">
        <Tabs defaultValue="tab1" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tab1">1</TabsTrigger>
            <TabsTrigger value="tab2">2</TabsTrigger>
            <TabsTrigger value="tab3">3</TabsTrigger>
            <TabsTrigger value="tab4">4</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="h-full mt-4">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Tab 1</h3>
              <p>Content for tab 1 will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="tab2" className="h-full mt-4">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Tab 2</h3>
              <p>Content for tab 2 will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="tab3" className="h-full mt-4">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Tab 3</h3>
              <p>Content for tab 3 will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="tab4" className="h-full mt-4">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Tab 4</h3>
              <p>Content for tab 4 will go here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateWorkOrder;