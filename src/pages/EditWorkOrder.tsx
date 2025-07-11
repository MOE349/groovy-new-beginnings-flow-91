import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import FormLayout from "@/components/FormLayout";
import { workOrderFormConfig } from "@/config/formLayouts";
import { apiCall } from "@/utils/apis";
import { workOrderFields } from "@/data/workOrderFormFields";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle } from "lucide-react";
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

  const customLayout = (props: any) => (
    <FormLayout      
        {...props}
      config={workOrderFormConfig}
    />
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