import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { apiPut, apiGet } from "@/utils/apis";
import { workOrderFields } from "@/data/workOrderFormFields";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const EditWorkOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: workOrderData, isLoading, isError, error } = useQuery({
    queryKey: ["work_order", id],
    queryFn: () => apiGet(`/work-orders/${id}`),
    enabled: !!id,
  });

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiPut(`/work-orders/${id}`, data);
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

  // Transform date strings to Date objects and object values to IDs for dropdowns
  const workOrder = workOrderData as any;
  const initialData = {
    ...workOrder,
    suggested_start_date: workOrder?.suggested_start_date ? new Date(workOrder.suggested_start_date) : undefined,
    completion_end_date: workOrder?.completion_end_date ? new Date(workOrder.completion_end_date) : undefined,
    // Transform object values to their IDs for dropdown compatibility
    asset: typeof workOrder?.asset === 'object' ? workOrder?.asset?.id : workOrder?.asset || "",
    status: typeof workOrder?.status === 'object' ? workOrder?.status?.id : workOrder?.status || "",
  };

  const customLayout = ({ handleSubmit, formData, handleFieldChange, loading, error, renderField }: any) => (
    <div className="space-y-0">
      {/* Top Bar */}
      <div className="h-10 flex items-center justify-between px-4 py-1 bg-secondary border-b border-border">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/workorders")}
          className="flex items-center gap-2 text-black dark:text-black hover:scale-105 transition-transform px-4 py-1 h-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Work Orders
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90 px-4 py-1 h-8 text-sm font-medium shadow-lg border border-secondary-foreground/20 hover:shadow-md transition-all duration-200"
          style={{
            boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          {loading ? "Updating..." : "Save"}
        </Button>
      </div>
      
      {/* Work Order Information Card */}
      <div className="bg-card rounded-md shadow-sm px-2 py-1 mt-4">
        <form onSubmit={handleSubmit} className="h-full">
          <div className="flex items-center gap-4 mb-4 py-1 -mx-2 bg-accent/20 border border-accent/30 rounded-md">
            <h3 className="text-h3 font-medium text-primary dark:text-secondary ml-6">Work Order Information</h3>
            {(formData?.code || formData?.description) && (
              <span className="text-h3 font-medium text-muted-foreground ml-16">
                {formData?.code && `(${formData.code})`} {formData?.description?.substring(0, 50)}
              </span>
            )}
          </div>
          
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 -mt-2 pb-1">
            {/* Left Column - Asset and Status */}
            <div className="lg:col-span-4 space-y-4">
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
                <label className="block text-sm font-medium text-foreground">Location</label>
                {renderField({ 
                  name: "asset.location", 
                  type: "input", 
                  disabled: true, 
                  inputType: "text"
                })}
              </div>
            </div>
            
            {/* Middle Column - Work Order Details */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Code</label>
                {renderField({ 
                  name: "code", 
                  type: "input", 
                  disabled: true, 
                  inputType: "text"
                })}
              </div>
              
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
            </div>
            
            {/* Right Column - Dates */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Suggested Start Date</label>
                {renderField({ 
                  name: "suggested_start_date", 
                  type: "datepicker"
                })}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Completion Date</label>
                {renderField({ 
                  name: "completion_end_date", 
                  type: "datepicker"
                })}
              </div>
            </div>
          </div>
          
          {/* Description - Full Width */}
          <div className="mt-6 space-y-2">
            <label className="block text-sm font-medium text-foreground">Description</label>
            {renderField({ 
              name: "description", 
              type: "textarea", 
              rows: 3
            })}
          </div>
        </form>
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