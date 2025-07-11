import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiCall } from "@/utils/apis";
import { workOrderFields } from "@/data/workOrderFormFields";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import FormLayout from "@/components/FormLayout";
import { workOrderFormConfig } from "@/config/formLayouts";

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

  const customLayout = (props: any) => (
    <div className="space-y-6">
      <FormLayout 
        {...props} 
        config={workOrderFormConfig}
      />
      
      {/* Tabs Section */}
      <div>
        <Tabs defaultValue="completion" className="h-full">
          {/* Compact Pill-Style Tab List */}
          <div className="h-10 overflow-x-auto">
            <TabsList className="grid w-full grid-cols-6 h-10 bg-card border border-border rounded-md p-0">
              <TabsTrigger 
                value="completion" 
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Completion
              </TabsTrigger>
              <TabsTrigger 
                value="checklist"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Checklist
              </TabsTrigger>
              <TabsTrigger 
                value="parts"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Parts
              </TabsTrigger>
              <TabsTrigger 
                value="services"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Third-party services
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
          <TabsContent value="completion" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Completion</h3>
              <p className="text-caption text-muted-foreground">Completion tracking and details will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="checklist" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Checklist</h3>
              <p className="text-caption text-muted-foreground">Checklist items and progress will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="parts" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Parts</h3>
              <p className="text-caption text-muted-foreground">Parts and materials needed will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="services" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Third-party services</h3>
              <p className="text-caption text-muted-foreground">Third-party services and contractors will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="files" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Files</h3>
              <p className="text-caption text-muted-foreground">Attached files and documents will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="log" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Log</h3>
              <p className="text-caption text-muted-foreground">Work order activity log will go here</p>
            </div>
          </TabsContent>
        </Tabs>
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