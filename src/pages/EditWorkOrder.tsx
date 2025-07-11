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
import WorkOrderFormLayout from "@/components/WorkOrderFormLayout";

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


  return (
    <div className="space-y-6">
      <div>
        <ApiForm
          fields={workOrderFields}
          onSubmit={handleSubmit}
          initialData={initialData}
          customLayout={WorkOrderFormLayout}
        />
      </div>

      {/* Compact Tabs Section */}
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
                value="misc-cost"
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
          <TabsContent value="completion" className="h-full mt-1">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Completion</h3>
              <p>Completion tracking and details will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="checklist" className="h-full mt-1">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Checklist</h3>
              <p>Work order checklist items will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="parts" className="h-full mt-1">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Parts</h3>
              <p>Parts and materials required will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="log" className="h-full mt-1">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Log</h3>
              <p>Work order activity log will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="misc-cost" className="h-full mt-1">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Third-party services</h3>
              <p>Third-party services and expenses will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="files" className="h-full mt-1">
            <div className="border rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">Files</h3>
              <p>Work order files and attachments will go here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditWorkOrder;