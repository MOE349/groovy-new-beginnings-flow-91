import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { apiPost, apiGet, apiPut } from "@/utils/apis";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle, ArrowLeft } from "lucide-react";
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
          
          <div className="grid grid-cols-5 gap-4 -mt-2">
            {/* First column - Asset, Status, Description */}
            <div className="col-span-3 p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
              <div className="flex items-center space-x-2">
                <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Asset</label>
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
              <div className="flex items-center space-x-2">
                <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Status</label>
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
            
            {/* Second column - Maint Type, Priority, Dates */}
            <div className="col-span-2 p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
              <div className="flex items-center space-x-2">
                <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Maint Type</label>
                <div className="flex-grow">
                  {renderField({ name: "maint_type", type: "input", inputType: "text" })}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Priority</label>
                <div className="flex-grow">
                  {renderField({ name: "priority", type: "input", inputType: "text" })}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Start Date</label>
                <div className="flex-grow">
                  {renderField({ name: "suggested_start_date", type: "datepicker" })}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Completion</label>
                <div className="flex-grow">
                  {renderField({ name: "completion_end_date", type: "datepicker" })}
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

export default EditWorkOrder;