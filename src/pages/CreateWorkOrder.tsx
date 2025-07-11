import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { apiCall } from "@/utils/apis";
import { workOrderFields } from "@/data/workOrderFormFields";

const CreateWorkOrder = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall("/work-orders/work_order", { method: 'POST', body: data });
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
    <div className="space-y-0 min-h-screen bg-background">
      {/* Top Header Bar */}
      <div className="h-14 flex items-center justify-between px-4 py-2 bg-warning text-warning-foreground">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/workorders")}
          className="flex items-center gap-2 text-warning-foreground hover:bg-warning/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6"
        >
          {loading ? "Creating..." : "Save"}
        </Button>
      </div>
      
      {/* Work Order Information Header */}
      <div className="bg-muted/30 px-6 py-4 border-b">
        <h1 className="text-xl font-medium text-foreground">Work Order Information</h1>
        <p className="text-sm text-muted-foreground">Code: {formData?.code || "New Work Order"}</p>
      </div>

      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <div className="w-72 bg-card border-r border-border p-4 space-y-4">
          {/* Offline Status */}
          <div className="bg-destructive text-destructive-foreground px-3 py-2 rounded text-center text-sm font-medium">
            × Offline
          </div>
          
          {/* Equipment Image */}
          <div className="bg-muted rounded-lg p-4 h-48 flex items-center justify-center">
            <img 
              src="/lovable-uploads/7a6b4ea9-42b9-4df7-a496-013f691bbde6.png" 
              alt="Equipment" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Location</label>
            {renderField({ 
              name: "asset.location", 
              type: "input", 
              disabled: true, 
              inputType: "text"
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Form Section */}
          <div className="flex-1 p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-6 max-w-4xl">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Asset</label>
                    {renderField({ 
                      name: "asset", 
                      type: "dropdown", 
                      required: true, 
                      endpoint: "/assets/equipments", 
                      queryKey: ["assets_equipments"], 
                      optionValueKey: "id", 
                      optionLabelKey: "name"
                    })}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Status</label>
                    {renderField({ 
                      name: "status", 
                      type: "dropdown", 
                      required: true, 
                      endpoint: "/work-orders/status", 
                      queryKey: ["work_orders_status"], 
                      optionValueKey: "id", 
                      optionLabelKey: "name"
                    })}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Description</label>
                    {renderField({ 
                      name: "description", 
                      type: "textarea", 
                      rows: 4
                    })}
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Maint Type</label>
                    {renderField({ 
                      name: "maint_type", 
                      type: "input", 
                      inputType: "text"
                    })}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Priority</label>
                    {renderField({ 
                      name: "priority", 
                      type: "input", 
                      inputType: "text"
                    })}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Start Date</label>
                    {renderField({ 
                      name: "suggested_start_date", 
                      type: "datepicker"
                    })}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Completion</label>
                    {renderField({ 
                      name: "completion_end_date", 
                      type: "datepicker"
                    })}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Bottom Tabs */}
          <div className="border-t bg-card">
            <Tabs defaultValue="completion" className="w-full">
              <TabsList className="h-12 w-full justify-start rounded-none bg-transparent border-b">
                <TabsTrigger value="completion" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                  Completion
                </TabsTrigger>
                <TabsTrigger value="checklist" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                  Checklist
                </TabsTrigger>
                <TabsTrigger value="parts" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                  Parts
                </TabsTrigger>
                <TabsTrigger value="services" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                  Third-party services
                </TabsTrigger>
                <TabsTrigger value="files" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                  Files
                </TabsTrigger>
                <TabsTrigger value="log" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                  Log
                </TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                <TabsContent value="completion">
                  <div className="text-muted-foreground">
                    Completion tracking and details will go here
                  </div>
                </TabsContent>
                <TabsContent value="checklist">
                  <div className="text-muted-foreground">
                    Checklist items will go here
                  </div>
                </TabsContent>
                <TabsContent value="parts">
                  <div className="text-muted-foreground">
                    Parts list will go here
                  </div>
                </TabsContent>
                <TabsContent value="services">
                  <div className="text-muted-foreground">
                    Third-party services will go here
                  </div>
                </TabsContent>
                <TabsContent value="files">
                  <div className="text-muted-foreground">
                    File attachments will go here
                  </div>
                </TabsContent>
                <TabsContent value="log">
                  <div className="text-muted-foreground">
                    Activity log will go here
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <ApiForm
        fields={workOrderFields}
        onSubmit={handleSubmit}
        initialData={{
          status: "Active",
        }}
        customLayout={customLayout}
      />
    </div>
  );
};

export default CreateWorkOrder;