import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import ApiTable from "@/components/ApiTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const [isEditChecklistDialogOpen, setIsEditChecklistDialogOpen] = useState(false);
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<any>(null);

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

  const handleChecklistSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall('/work-orders/work_orders/checklists', { method: 'POST', body: data });
      // Invalidate and refetch the checklist table
      queryClient.invalidateQueries({
        queryKey: ["work_order_checklists", id]
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
      await apiCall(`/work-orders/work_orders/checklists/${selectedChecklistItem.id}`, { 
        method: 'PUT', 
        body: data 
      });
      // Invalidate and refetch the checklist table
      queryClient.invalidateQueries({
        queryKey: ["work_order_checklists", id]
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
      await apiCall('/work-orders/work_order_completion_note', { method: 'POST', body: data });
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

  const handleCompletionFieldChange = async (name: string, value: any, allFormData: Record<string, any>) => {
    // Auto-save on field change
    const dataToSave = { ...allFormData, [name]: value };
    try {
      await apiCall('/work-orders/work_order_completion_note', { method: 'POST', body: dataToSave });
    } catch (error: any) {
      // Silently fail auto-save, user can manually save if needed
      console.error('Auto-save failed:', error);
    }
  };

  const handleRowClick = (row: any) => {
    setSelectedChecklistItem(row);
    setIsEditChecklistDialogOpen(true);
  };

  const checklistFormTemplate: FormField[] = [  
    {
      name: "description",
      type: "textarea",
      label: "Description",
      required: true,
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
    }
  ];

  const completionFormFields: FormField[] = [
    {
      name: "work_order",
      type: "input",
      inputType: "hidden",
      required: true,
    },
    {
      name: "problem",
      type: "textarea",
      label: "Problem",
      required: false,
      rows: 6,
      placeholder: "(briefly outline the problem, if any)",
    },
    {
      name: "root_cause",
      type: "textarea",
      label: "Root Cause",
      required: false,
      rows: 6,
      placeholder: "(short description of the cause of issue, if any)",
    },
    {
      name: "solution",
      type: "textarea",
      label: "Solution",
      required: false,
      rows: 6,
      placeholder: "(short description of the solution, if any)",
    },
    {
      name: "completion_notes",
      type: "textarea",
      label: "Completion Notes",
      required: false,
      rows: 6,
    },
    {
      name: "admin_notes",
      type: "textarea",
      label: "Admin Notes",
      required: false,
      rows: 6,
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
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              
              <div className="flex">
                <div className="w-1/2 pr-8">
                  <ApiForm
                    fields={completionFormFields}
                    onSubmit={handleCompletionSubmit}
                    initialData={{ 
                      work_order: id,
                      problem: workOrder?.problem || "",
                      root_cause: workOrder?.root_cause || "",
                      solution: workOrder?.solution || "",
                      completion_notes: workOrder?.completion_notes || "",
                      admin_notes: workOrder?.admin_notes || "",
                    }}
                    customLayout={({ fields, formData, handleFieldChange, renderField }) => (
                      <div className="space-y-6">
                        {fields.map(field => {
                          if (field.inputType === "hidden") {
                            return renderField(field);
                          }
                          
                          // Clone the field render and add onBlur auto-save
                          const originalField = renderField(field);
                          return (
                            <div key={field.name} className="space-y-2" onBlur={() => {
                              handleCompletionFieldChange(field.name, formData[field.name], formData);
                            }}>
                              {originalField}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  />
                </div>
                <div className="w-1/2">
                  {/* Right side empty for now */}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="checklist" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
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
              </div>
              <ApiTable
                endpoint={`/work-orders/work_orders/checklists?work_order_id=${id}`}
                columns={[
                  { key: 'completed_by', header: 'Completed By', type: 'object' },
                  { key: 'completion_date', header: 'Completion Date', type: 'date' },
                  { key: 'hrs_spent', header: 'Hrs Spent', type: 'string' },
                  { key: 'description', header: 'Description', type: 'string' },
                ]}
                queryKey={["work_order_checklists", id]}
                emptyMessage="No checklist items found"
                onRowClick={handleRowClick}
              />
              
              {/* Edit Checklist Dialog */}
              <Dialog open={isEditChecklistDialogOpen} onOpenChange={setIsEditChecklistDialogOpen}>
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
                        completed_by: typeof selectedChecklistItem.completed_by === 'object' 
                          ? selectedChecklistItem.completed_by?.id 
                          : selectedChecklistItem.completed_by,
                        completion_date: selectedChecklistItem.completion_date 
                          ? new Date(selectedChecklistItem.completion_date) 
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
              <ApiTable
                endpoint={`/work-orders/work_order_log?work_order_id=${id}`}
                columns={[
                  { key: 'user', header: 'User', type: 'object' },
                  { key: 'amount', header: 'Amount', type: 'string' },
                  { key: 'log_type', header: 'Log Type', type: 'string' },
                  { key: 'description', header: 'Description', type: 'string' },
                  { 
                    key: 'created_at', 
                    header: 'Date', 
                    type: 'date',
                    render: (value: any) => {
                      if (!value) return '';
                      const date = new Date(value);
                      return date.toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      });
                    }
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