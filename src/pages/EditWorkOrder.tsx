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

  const { data: workOrderResponse, isLoading, isError, error } = useQuery({
    queryKey: ["work_order", id],
    queryFn: () => apiGet(`/work-orders/work_order/${id}`),
    enabled: !!id,
  });

  const workOrderData = workOrderResponse?.data;

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

  // Transform date strings to Date objects and object values to IDs for dropdowns
  const initialData = workOrderData ? {
    ...workOrderData,
    // Date transformations
    suggested_start_date: workOrderData?.suggested_start_date ? new Date(workOrderData.suggested_start_date) : undefined,
    completion_end_date: workOrderData?.completion_end_date ? new Date(workOrderData.completion_end_date) : undefined,
    // Transform nested object values to their IDs for dropdown compatibility
    asset: workOrderData?.asset?.id || workOrderData?.asset || "",
    status: workOrderData?.status?.id || workOrderData?.status || "",
    // Handle location - work order doesn't have direct location, get from asset
    location: workOrderData?.asset?.location?.id || workOrderData?.location?.id || workOrderData?.location || "",
    // Handle boolean values
    is_online: workOrderData?.asset?.is_online || workOrderData?.is_online || false,
    // Ensure all form fields have values
    maint_type: workOrderData?.maint_type || "",
    priority: workOrderData?.priority || "",
    starting_meter_reading: workOrderData?.starting_meter_reading || "",
    completion_meter_reading: workOrderData?.completion_meter_reading || "",
    description: workOrderData?.description || "",
  } : {};

  const customLayout = ({ handleSubmit, formData, handleFieldChange, loading, error, renderField }: any) => (
    <div className="space-y-0">
      {/* Top Bar */}
      <div className="h-10 flex items-center justify-between px-4 py-1 bg-secondary border-b border-border">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/workorders")}
          className="flex items-center gap-2 text-black dark:text-black px-4 py-1 h-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90 px-4 py-1 h-8 text-sm font-medium shadow-lg border border-secondary-foreground/20 hover:shadow-md transition-all duration-200"
          style={{
            boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          {loading ? "Loading..." : "Save"}
        </Button>
      </div>
      
      {/* Work Order Information Box */}
      <div className="bg-card rounded-md shadow-sm px-2 py-1 mt-4">
        <form onSubmit={handleSubmit} className="h-full">
          <div 
            className="flex items-center gap-4 mb-4 py-1 -mx-2 bg-accent/20 border border-accent/30 rounded-md"
          >
            <h3 className="text-h3 font-medium text-primary dark:text-secondary ml-6">Work Order Information</h3>
            <div className="ml-6 text-sm text-muted-foreground">
              Code: {formData?.code || "Loading..."}
            </div>
          </div>
          
          {/* Layout matching equipment design */}
          <div className="flex gap-8 items-center -mt-2 pb-1">
            {/* Left Section - Image, toggle, location */}
            <div className="flex flex-col space-y-1 w-64 pl-6">
              <div className="flex items-center space-x-0">
                <div 
                  className={`flex items-center cursor-pointer transition-all duration-300 rounded border w-48 h-8 ${
                    formData?.is_online 
                      ? 'bg-green-500 border-green-600' 
                      : 'bg-red-500 border-red-600'
                  }`}
                  onClick={() => handleFieldChange("is_online", !formData?.is_online)}
                >
                  {/* Status text with icon */}
                  <div className="flex items-center justify-center gap-1 text-sm font-medium text-white w-full">
                    {formData?.is_online ? (
                      <>
                        <Check size={12} />
                        Online
                      </>
                    ) : (
                      <>
                        <X size={12} />
                        Offline
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-48 h-32 bg-muted rounded border-2 border-border overflow-hidden">
                <img 
                  src="/lovable-uploads/cf9d21df-6820-4bea-ae16-54c41a67117e.png" 
                  alt="Work Order" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 w-48">
                <label className="block text-caption font-normal text-foreground text-center">Location</label>
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
            
            {/* Right Section - Form fields in two columns */}
            <div className="flex-1">
              <div className="flex gap-6 w-full">
                {/* First sub-column - Asset, Status, Description */}
                <div className="w-3/5 p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2">Asset</label>
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
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2">Status</label>
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
                <div className="w-2/5 p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Maint Type</label>
                    <div className="flex-grow">
                      {renderField({ name: "maint_type", type: "input", inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Priority</label>
                    <div className="flex-grow">
                      {renderField({ name: "priority", type: "input", inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Start Date</label>
                    <div className="flex-grow">
                      {renderField({ name: "suggested_start_date", type: "datepicker" })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Completion</label>
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