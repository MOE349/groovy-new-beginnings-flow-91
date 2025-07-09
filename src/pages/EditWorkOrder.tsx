import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { apiPost, apiGet, apiPut } from "@/utils/apis";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle, ArrowLeft, Check, X } from "lucide-react";
import { workOrderFields } from "@/data/workOrderFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const EditWorkOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  console.log("EditWorkOrder - ID from URL:", id);

  const { data: workOrderResponse, isLoading, isError, error } = useQuery({
    queryKey: ["work_order", id],
    queryFn: () => {
      console.log("API call being made for work order:", id);
      return apiGet(`/work-orders/work_order/${id}`);
    },
    enabled: !!id,
  });

  console.log("Query state:", { workOrderResponse, isLoading, isError, error });
  const workOrderData = workOrderResponse?.data;
  console.log("Work Order Data:", workOrderData);

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiPut(`/work-orders/work_order/${id}`, data);
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

  if (!workOrderData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  console.log("Work Order Data:", workOrderData);

  // Transform date strings to Date objects and object values to IDs for dropdowns
  const initialData = workOrderData ? {
    ...workOrderData,
    suggested_start_date: workOrderData?.suggested_start_date ? new Date(workOrderData.suggested_start_date) : undefined,
    completion_end_date: workOrderData?.completion_end_date ? new Date(workOrderData.completion_end_date) : undefined,
    // Transform object values to their IDs for dropdown compatibility
    asset: workOrderData?.asset?.id || workOrderData?.asset || "",
    status: workOrderData?.status?.id || workOrderData?.status || "",
    location: workOrderData?.location?.id || workOrderData?.location || "",
    is_online: workOrderData?.is_online || false,
  } : {};

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
          {loading ? "Loading..." : "Save"}
        </Button>
      </div>
      
      {/* Work Order Information Box */}
      <div className="bg-card rounded-md shadow-sm px-2 py-1 mt-4">
        <form onSubmit={handleSubmit} className="h-full">
          <div 
            className="flex items-center gap-4 mb-4 py-1 -mx-2 bg-muted-foreground/20 border border-border rounded-md"
          >
            <h3 className="text-h3 font-medium text-primary ml-6">Work Order Information</h3>
            <div className="ml-auto mr-6 text-sm text-muted-foreground">
              Code: {formData?.code || "Loading..."}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 -mt-2">
            {/* Left Column - Online toggle + image + location */}
            <div className="lg:col-span-2 space-y-3 flex flex-col items-center justify-center">
              <div className="flex items-center space-x-0">
                <div 
                  className={`flex items-center cursor-pointer transition-all duration-300 rounded border w-48 h-8 ${
                    formData?.is_online 
                      ? 'bg-green-500 border-green-600' 
                      : 'bg-red-500 border-red-600'
                  }`}
                  onClick={() => handleFieldChange("is_online", !formData?.is_online)}
                >
                  {/* Icon section */}
                  <div className="flex items-center justify-center w-8 h-full text-white">
                    {formData?.is_online ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                  </div>
                  
                  {/* Status text */}
                  <div className="flex-1 text-sm font-medium text-white text-center">
                    {formData?.is_online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              <div className="w-48 h-32 bg-muted rounded border overflow-hidden">
                <img 
                  src="/lovable-uploads/cf9d21df-6820-4bea-ae16-54c41a67117e.png" 
                  alt="Work Order" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 w-48">
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
            
            {/* Right Column - Two sub-columns for form fields */}
            <div className="lg:col-span-10">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-2">
                {/* First sub-column - Asset, Status, Description */}
                <div className="md:col-span-3 p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Asset</label>
                    <div className="flex-grow">
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
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Status</label>
                    <div className="flex-grow">
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
                  </div>
                  <div className="flex items-start space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0 pt-1">Description</label>
                    <div className="flex-grow">
                      {renderField({ name: "description", type: "textarea", rows: 4 })}
                    </div>
                  </div>
                </div>
                
                {/* Second sub-column - Maint Type, Priority, Dates */}
                <div className="md:col-span-2 p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Maint Type</label>
                    <div className="flex-grow">
                      {renderField({ name: "maint_type", type: "input", inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Priority</label>
                    <div className="flex-grow">
                      {renderField({ name: "priority", type: "input", inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Start Date</label>
                    <div className="flex-grow">
                      {renderField({ name: "suggested_start_date", type: "datepicker" })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Completion</label>
                    <div className="flex-grow">
                      {renderField({ name: "completion_end_date", type: "datepicker" })}
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
          fields={workOrderFields}
          onSubmit={handleSubmit}
          initialData={initialData}
          customLayout={customLayout}
        />
      </div>

      {/* Tabs Section */}
      <div className="flex-1">
        <Tabs defaultValue="completion" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="completion">Completion</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="parts">Parts</TabsTrigger>
            <TabsTrigger value="log">Log</TabsTrigger>
          </TabsList>
          <TabsContent value="completion" className="h-full mt-4">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Completion</h3>
              <p>Completion tracking and details will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="checklist" className="h-full mt-4">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Checklist</h3>
              <p>Work order checklist items will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="parts" className="h-full mt-4">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Parts</h3>
              <p>Parts and materials required will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="log" className="h-full mt-4">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Log</h3>
              <p>Work order activity log will go here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditWorkOrder;