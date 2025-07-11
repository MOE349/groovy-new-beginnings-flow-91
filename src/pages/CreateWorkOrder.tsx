import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { apiPost } from "@/utils/apis";
import { workOrderFields } from "@/data/workOrderFormFields";

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
    <div className="space-y-0">
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/workorders")}
          className="flex items-center gap-2 text-foreground hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Work Orders
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6"
        >
          {loading ? "Creating..." : "Create Work Order"}
        </Button>
      </div>
      
      {/* Work Order Information Card */}
      <div className="bg-card rounded-md shadow-sm px-6 py-4 mt-4">
        <form onSubmit={handleSubmit} className="h-full">
          <div className="flex items-center gap-4 mb-6 py-2 -mx-2 bg-muted-foreground/20 border border-border rounded-md">
            <h3 className="text-h3 font-medium text-primary ml-6">Work Order Information</h3>
          </div>
          
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Asset Selection and Status */}
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
            
            {/* Right Column - Dates and Description */}
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
        initialData={{
          status: "Active",
        }}
        customLayout={customLayout}
      />
    </div>
  );
};

export default CreateWorkOrder;