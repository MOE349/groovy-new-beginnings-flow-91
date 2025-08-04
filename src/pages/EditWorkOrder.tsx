import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import ApiTable from "@/components/ApiTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiCall } from "@/utils/apis";
import { workOrderFields } from "@/data/workOrderFormFields";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FormLayout from "@/components/FormLayout";
import { workOrderFormConfig } from "@/config/formLayouts";
import { useState } from "react";
import { FormField } from "@/components/ApiForm";

const EditWorkOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [isEditChecklistDialogOpen, setIsEditChecklistDialogOpen] =
    useState(false);
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<any>(null);
  const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false);
  const [isEditServicesDialogOpen, setIsEditServicesDialogOpen] =
    useState(false);
  const [selectedServiceItem, setSelectedServiceItem] = useState<any>(null);

  const {
    data: workOrderData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["work_order", id],
    queryFn: () => apiCall(`/work-orders/work_order/${id}`),
    enabled: !!id,
  });

  const { data: completionData, isLoading: isCompletionLoading } = useQuery({
    queryKey: ["work_order_completion_note", id],
    queryFn: () =>
      apiCall(`/work-orders/work_order_completion_note?work_order=${id}`),
    enabled: !!id,
  });

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall(`/work-orders/work_order/${id}`, {
        method: "PATCH",
        body: data,
      });
      toast({
        title: "Success",
        description: "Work order updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update work order",
        variant: "destructive",
      });
    }
  };

  const handleChecklistSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall("/work-orders/work_orders/checklists", {
        method: "POST",
        body: data,
      });
      // Invalidate and refetch the checklist table
      queryClient.invalidateQueries({
        queryKey: ["work_order_checklists", id],
      });
      toast({
        title: "Success",
        description: "Checklist item created successfully!",
      });
      setIsChecklistDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checklist item",
        variant: "destructive",
      });
    }
  };

  const handleEditChecklistSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall(
        `/work-orders/work_orders/checklists/${selectedChecklistItem.id}`,
        {
          method: "PATCH",
          body: data,
        }
      );
      // Invalidate and refetch the checklist table
      queryClient.invalidateQueries({
        queryKey: ["work_order_checklists", id],
      });
      toast({
        title: "Success",
        description: "Checklist item updated successfully!",
      });
      setIsEditChecklistDialogOpen(false);
      setSelectedChecklistItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update checklist item",
        variant: "destructive",
      });
    }
  };

  const handleCompletionSubmit = async (data: Record<string, any>) => {
    try {
      const completionId = completionData?.data?.data?.id;
      const initialData = completionData?.data?.data || {};

      // Only send fields that changed
      const changedFields = Object.keys(data).reduce(
        (acc: Record<string, any>, key) => {
          if (data[key] !== initialData[key]) {
            acc[key] = data[key];
          }
          return acc;
        },
        {}
      );

      if (completionId) {
        // Update existing completion note with PATCH and only send changed fields
        await apiCall(
          `/work-orders/work_order_completion_note/${completionId}`,
          {
            method: "PATCH",
            body: changedFields,
          }
        );
      } else {
        // Create new completion note if none exists
        await apiCall("/work-orders/work_order_completion_note", {
          method: "POST",
          body: data,
        });
      }
      toast({
        title: "Success",
        description: "Completion notes saved successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save completion notes",
        variant: "destructive",
      });
    }
  };

  const handleCompletionFieldChange = async (
    name: string,
    value: any,
    allFormData: Record<string, any>
  ) => {
    try {
      const completionId = completionData?.data?.data?.id;
      const initialData = completionData?.data?.data || {};

      // For field change, we only need to send the changed field
      const dataToSave = { [name]: value };
      // Include work_order field if creating a new record
      if (!completionId) {
        dataToSave.work_order = id;
      }

      if (completionId) {
        // Update existing completion note with PATCH and only send changed field
        await apiCall(
          `/work-orders/work_order_completion_note/${completionId}`,
          {
            method: "PATCH",
            body: dataToSave,
          }
        );
      } else {
        // Create new completion note if none exists
        await apiCall("/work-orders/work_order_completion_note", {
          method: "POST",
          body: dataToSave,
        });
      }
    } catch (error: any) {
      // Silently fail auto-save, user can manually save if needed
      console.error("Auto-save failed:", error);
    }
  };

  const handleServicesSubmit = async (data: Record<string, any>) => {
    try {
      // Add work order ID to the data
      const dataWithWorkOrder = { ...data, work_order: id };
      await apiCall("/work-orders/work_order_misc_cost", {
        method: "POST",
        body: dataWithWorkOrder,
      });
      // Invalidate and refetch the services table
      queryClient.invalidateQueries({
        queryKey: ["work_order_misc_cost", id],
      });
      toast({
        title: "Success",
        description: "Third-party service created successfully!",
      });
      setIsServicesDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create third-party service",
        variant: "destructive",
      });
    }
  };

  const handleServicesRowClick = (row: any) => {
    setSelectedServiceItem(row);
    setIsEditServicesDialogOpen(true);
  };

  const handleEditServicesSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall(
        `/work-orders/work_order_misc_cost/${selectedServiceItem.id}`,
        {
          method: "PATCH",
          body: data,
        }
      );
      // Invalidate and refetch the services table
      queryClient.invalidateQueries({
        queryKey: ["work_order_misc_cost", id],
      });
      toast({
        title: "Success",
        description: "Third-party service updated successfully!",
      });
      setIsEditServicesDialogOpen(false);
      setSelectedServiceItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update third-party service",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (row: any) => {
    setSelectedChecklistItem(row);
    setIsEditChecklistDialogOpen(true);
  };

  const checklistFormTemplate: FormField[] = [
    {
      name: "work_order",
      type: "input",
      inputType: "hidden",
      required: false,
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      required: false,
      rows: 3,
    },
    {
      name: "completed_by",
      type: "dropdown",
      label: "Completed By",
      required: false,
      endpoint: "/users/user",
      queryKey: ["users_user"],
      optionValueKey: "id",
      optionLabelKey: "name",
    },
    {
      name: "completion_date",
      type: "datepicker",
      label: "Completion Date",
      required: false,
    },
    {
      name: "hrs_spent",
      type: "input",
      label: "Hrs Spent",
      required: false,
      inputType: "text",
    },
  ];

  const completionFormFields: FormField[] = [
    {
      name: "work_order",
      type: "input",
      inputType: "hidden",
      required: false,
    },
    {
      name: "problem",
      type: "textarea",
      label: "Problem",
      required: false,
      rows: 4,
    },
    {
      name: "solution",
      type: "textarea",
      label: "Solution",
      required: false,
      rows: 4,
    },
    {
      name: "completion_notes",
      type: "textarea",
      label: "Completion Notes",
      required: false,
      rows: 4,
    },
  ];

  const servicesFormTemplate: FormField[] = [
    {
      name: "work_order",
      type: "input",
      inputType: "hidden",
      required: false,
    },
    {
      name: "total_cost",
      type: "input",
      label: "Total Cost",
      required: false,
      inputType: "text",
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      required: false,
      rows: 3,
    },
  ];

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
    suggested_start_date: workOrder?.suggested_start_date
      ? new Date(workOrder.suggested_start_date + "T00:00:00")
      : undefined,
    completion_end_date: workOrder?.completion_end_date
      ? new Date(workOrder.completion_end_date + "T00:00:00")
      : undefined,
    // Transform object values to their IDs for dropdown compatibility
    asset:
      typeof workOrder?.asset === "object"
        ? workOrder?.asset?.id
        : workOrder?.asset || "",
    status:
      typeof workOrder?.status === "object"
        ? workOrder?.status?.id
        : workOrder?.status || "",
    // Handle asset.location field - extract location name from nested object
    "asset.location":
      workOrder?.asset?.location?.name || workOrder?.asset?.location || "",
  };

  const customLayout = (props: any) => (
    <div className="space-y-6">
      <FormLayout
        {...props}
        config={workOrderFormConfig}
        initialData={initialData}
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
                onClick={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["work_order_completion_note", id],
                  });
                }}
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
                Logs
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content Panels - Compact */}
          <TabsContent value="completion" className="mt-1">
            <div className="bg-card rounded-lg border p-4 space-y-4">
              {/* Problem Analysis and Summary - Side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-background/50 rounded border p-3">
                  <h4 className="text-sm font-medium text-foreground mb-2 border-b border-border pb-1">
                    Problem Analysis
                  </h4>
                  <ApiForm
                    fields={completionFormFields.filter(
                      (field) =>
                        field.name === "work_order" ||
                        field.name === "problem" ||
                        field.name === "solution" ||
                        field.name === "completion_notes"
                    )}
                    onSubmit={handleCompletionSubmit}
                    initialData={{
                      work_order: id,
                      problem: completionData?.data?.data?.problem || "",
                      solution: completionData?.data?.data?.solution || "",
                      completion_notes:
                        completionData?.data?.data?.completion_notes || "",
                    }}
                    customLayout={({ fields, formData, renderField }) => (
                      <div className="space-y-3">
                        {fields.map((field) => {
                          if (field.inputType === "hidden")
                            return renderField(field);
                          return (
                            <div
                              key={field.name}
                              onBlur={() => {
                                handleCompletionFieldChange(
                                  field.name,
                                  formData[field.name],
                                  formData
                                );
                              }}
                            >
                              {renderField(field)}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  />
                </div>

                <div className="bg-background/50 rounded border p-3">
                  <h4 className="text-sm font-medium text-foreground mb-2 border-b border-border pb-1">
                    Summary
                  </h4>
                  <div className="space-y-3">
                    {/* Compact Summary */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Hours:</span>
                        <div className="bg-card rounded border px-2 py-1 mt-1">
                          {completionData?.data?.data?.total_hrs_spent ||
                            "Not set"}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">By:</span>
                        <div className="bg-card rounded border px-2 py-1 mt-1">
                          {completionData?.data?.data?.completed_by ||
                            "Not set"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="checklist" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <Dialog
                  open={isChecklistDialogOpen}
                  onOpenChange={setIsChecklistDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Checklist Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Checklist Item</DialogTitle>
                    </DialogHeader>
                    <ApiForm
                      fields={checklistFormTemplate}
                      onSubmit={handleChecklistSubmit}
                      submitText="Create Checklist Item"
                      initialData={{ work_order: id }}
                    />
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      console.log("Full workOrderData:", workOrderData);
                      console.log("Asset payload:", {
                        asset: workOrderData?.data?.data?.asset?.id,
                      });

                      if (!workOrderData?.data?.data?.asset?.id) {
                        toast({
                          title: "Error",
                          description:
                            "Asset information not available. Please wait for the work order to load.",
                          variant: "destructive",
                        });
                        return;
                      }

                      const response = await apiCall(
                        `/work-orders/work_order/${id}/import-backlogs`,
                        {
                          method: "POST",
                          body: { asset: workOrderData.data.data.asset.id },
                        }
                      );

                      console.log("=== API CALL RESPONSE ===");
                      console.log(response);
                      console.log("=== RESPONSE STRINGIFIED ===");
                      console.log(JSON.stringify(response, null, 2));

                      // Refresh the checklist table
                      queryClient.invalidateQueries({
                        queryKey: ["work_order_checklists", id],
                      });

                      toast({
                        title: "Success",
                        description: "Backlog items imported successfully!",
                      });
                    } catch (error: any) {
                      console.log("=== FULL ERROR OBJECT ===");
                      console.log(error);
                      console.log("=== ERROR STRINGIFIED ===");
                      console.log(JSON.stringify(error, null, 2));
                      console.error(
                        "Import backlog error - Full error object:",
                        error
                      );
                      console.error("Error message:", error?.message);
                      console.error("Error response:", error?.response);
                      console.error("Error status:", error?.status);
                      console.error("Error data:", error?.data);

                      // Custom alert format: title = key + status code, body = value
                      if (error?.data?.errors && error?.status) {
                        const errors = error.data.errors;
                        const statusCode = error.status;

                        // Get the first error key and value
                        const errorKey = Object.keys(errors)[0];
                        const errorValue = errors[errorKey];

                        toast({
                          title: `${errorKey} ${statusCode}`,
                          description: errorValue,
                          variant: "destructive",
                        });
                      } else {
                        // Fallback to generic error message
                        toast({
                          title: "Error",
                          description:
                            error?.message || "Failed to import backlog items",
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                >
                  Load Backlog
                </Button>
              </div>
              <ApiTable
                endpoint={`/work-orders/work_orders/checklists?work_order_id=${id}`}
                columns={[
                  { key: "description", header: "Description", type: "string" },
                  { key: "hrs_spent", header: "Hrs Spent", type: "string" },
                  {
                    key: "completed_by",
                    header: "Completed By",
                    type: "object",
                  },
                  {
                    key: "completion_date",
                    header: "Completion Date",
                    type: "date",
                  },
                ]}
                queryKey={["work_order_checklists", id]}
                emptyMessage="No checklist items found"
                onRowClick={handleRowClick}
              />

              {/* Edit Checklist Dialog */}
              <Dialog
                open={isEditChecklistDialogOpen}
                onOpenChange={setIsEditChecklistDialogOpen}
              >
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Checklist Item</DialogTitle>
                  </DialogHeader>
                  {selectedChecklistItem && (
                    <ApiForm
                      fields={checklistFormTemplate}
                      onSubmit={handleEditChecklistSubmit}
                      submitText="Update Checklist Item"
                      initialData={{
                        ...selectedChecklistItem,
                        work_order: id,
                        completed_by:
                          typeof selectedChecklistItem.completed_by === "object"
                            ? selectedChecklistItem.completed_by?.id
                            : selectedChecklistItem.completed_by,
                        completion_date: selectedChecklistItem.completion_date
                          ? new Date(
                              selectedChecklistItem.completion_date +
                                "T00:00:00"
                            )
                          : undefined,
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent value="parts" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Parts</h3>
              <p className="text-caption text-muted-foreground">
                Parts and materials needed will go here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <Dialog
                  open={isServicesDialogOpen}
                  onOpenChange={setIsServicesDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Third-party Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Third-party Service</DialogTitle>
                    </DialogHeader>
                    <ApiForm
                      fields={servicesFormTemplate}
                      onSubmit={handleServicesSubmit}
                      submitText="Create Service Entry"
                      initialData={{ work_order: id }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <ApiTable
                endpoint={`/work-orders/work_order_misc_cost?work_order=${id}`}
                columns={[
                  { key: "total_cost", header: "Total Cost", type: "string" },
                  { key: "description", header: "Description", type: "string" },
                ]}
                queryKey={["work_order_misc_cost", id]}
                emptyMessage="No third-party services found"
                onRowClick={handleServicesRowClick}
              />

              {/* Edit Services Dialog */}
              <Dialog
                open={isEditServicesDialogOpen}
                onOpenChange={setIsEditServicesDialogOpen}
              >
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Third-party Service</DialogTitle>
                  </DialogHeader>
                  {selectedServiceItem && (
                    <ApiForm
                      fields={servicesFormTemplate}
                      onSubmit={handleEditServicesSubmit}
                      submitText="Update Service Entry"
                      initialData={{
                        ...selectedServiceItem,
                        work_order: id,
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Files</h3>
              <p className="text-caption text-muted-foreground">
                Attached files and documents will go here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="log" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <ApiTable
                endpoint={`/work-orders/work_order_log?work_order_id=${id}`}
                columns={[
                  { key: "user", header: "User", type: "object" },
                  { key: "amount", header: "Amount", type: "string" },
                  { key: "log_type", header: "Log Type", type: "string" },
                  { key: "description", header: "Description", type: "string" },
                  {
                    key: "created_at",
                    header: "Date",
                    type: "date",
                    render: (value: any) => {
                      if (!value) return "";
                      const date = new Date(value);
                      return date.toLocaleString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      });
                    },
                  },
                ]}
                queryKey={["work_order_log", id]}
                emptyMessage="No log entries found"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-x-auto min-w-0">
      <div className="space-y-6 min-w-[1440px]">
        <ApiForm
          fields={workOrderFields}
          onSubmit={handleSubmit}
          initialData={initialData}
          customLayout={customLayout}
        />
      </div>
    </div>
  );
};

export default EditWorkOrder;
