import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiCall } from "@/utils/apis";
import { workOrderFields } from "@/data/workOrderFormFields";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const EditWorkOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: workOrderData, isLoading, isError, error } = useQuery({
    queryKey: ["work_order", id],
    queryFn: () => apiCall(`/work-orders/work_order/${id}`),
    enabled: !!id,
  });

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall(`/work-orders/work_order/${id}`, { method: 'PUT', body: data });
      toast({
        title: "Success",
        description: "Work order updated successfully!",
      });
      navigate("/workorders");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update work order",
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
            Failed to load work order data: {error?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

    if (!workOrderData || !workOrderData.data || !workOrderData.data.data) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  // Transform date strings to Date objects and object values to IDs for dropdowns
  const workOrder = workOrderData.data.data as any;
  const initialData = {
    ...workOrder,
    suggested_start_date: workOrder?.suggested_start_date ? new Date(workOrder.suggested_start_date) : undefined,
    completion_end_date: workOrder?.completion_end_date ? new Date(workOrder.completion_end_date) : undefined,
    // Transform object values to their IDs for dropdown compatibility
    asset: typeof workOrder?.asset === 'object' ? workOrder?.asset?.id : workOrder?.asset || "",
    status: typeof workOrder?.status === 'object' ? workOrder?.status?.id : workOrder?.status || "",
    // Handle asset.location field - extract location name from nested object
    "asset.location": workOrder?.asset?.location?.name || workOrder?.asset?.location || "",
  };

  const customLayout = ({ handleSubmit, formData, handleFieldChange, loading, error, renderField }: any) => (
    <div className="min-h-screen bg-background">
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
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
      
      {/* Work Order Information Header */}
      <div className="bg-muted/30 px-6 py-4 border-b">
        <h1 className="text-xl font-medium text-foreground">Work Order Information</h1>
        <p className="text-sm text-muted-foreground">Code: {formData?.code || "Loading..."}</p>
      </div>

      <div className="flex">
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
        <div className="flex-1">
          {/* Form Section */}
          <div className="p-6 bg-background border-b">
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
          <div className="bg-card">
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
                  <div>
                    <h3 className="text-lg font-medium mb-2">Completion</h3>
                    <p className="text-muted-foreground">Completion tracking and details will go here</p>
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
        initialData={initialData}
        customLayout={customLayout}
      />
    </div>
  );
};

export default EditWorkOrder;