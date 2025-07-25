import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import ApiTable from "@/components/ApiTable";
import ApiForm from "@/components/ApiForm";
import { siteFormFields, locationFormFields } from "@/data/siteFormFields";
import { equipmentCategoryFormFields, attachmentCategoryFormFields } from "@/data/categoryFormFields";
import { apiCall } from "@/utils/apis";
import { handleApiError } from "@/utils/errorHandling";

const workOrderStatusFormFields = [
  {
    name: "control",
    type: "dropdown" as const,
    label: "Control",
    required: true,
    endpoint: "/work-orders/controls",
    optionValueKey: "id",
    optionLabelKey: "name"
  },
  {
    name: "name",
    type: "input" as const,
    label: "Name",
    required: true,
    inputType: "text" as const
  }
];

const weightClassFormFields = [
  {
    name: "name",
    type: "input" as const,
    label: "Name",
    required: true,
    inputType: "text" as const
  },
  {
    name: "weight",
    type: "input" as const,
    label: "Weight",
    required: true,
    inputType: "text" as const
  }
];

const projectFormFields = [
  {
    name: "name",
    type: "input" as const,
    label: "Name",
    required: true,
    inputType: "text" as const
  }
];

const accountCodeFormFields = [
  {
    name: "name",
    type: "input" as const,
    label: "Name",
    required: true,
    inputType: "text" as const
  }
];

const jobCodeFormFields = [
  {
    name: "name",
    type: "input" as const,
    label: "Name",
    required: true,
    inputType: "text" as const
  }
];

const assetStatusFormFields = [
  {
    name: "name",
    type: "input" as const,
    label: "Name",
    required: true,
    inputType: "text" as const
  }
];

const Settings = () => {
  const [dialogOpen, setDialogOpen] = useState<'site' | 'location' | 'equipmentCategory' | 'attachmentCategory' | 'workOrderStatus' | 'weightClass' | 'project' | 'accountCode' | 'jobCode' | 'assetStatus' | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSiteSubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      if (editingItem) {
        await apiCall(`/company/site/${editingItem.id}`, { method: 'PUT', body: data });
        toast({
          title: "Success",
          description: "Site updated successfully",
        });
      } else {
        await apiCall("/company/site", { method: 'POST', body: data });
        toast({
          title: "Success",
          description: "Site created successfully",
        });
      }
      // Invalidate and refetch the sites query
      await queryClient.invalidateQueries({ queryKey: ["/company/site"] });
      setDialogOpen(null);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingItem ? 'update' : 'create'} site`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      if (editingItem) {
        await apiCall(`/company/location/${editingItem.id}`, { method: 'PUT', body: data });
        toast({
          title: "Success",
          description: "Location updated successfully",
        });
      } else {
        await apiCall("/company/location", { method: 'POST', body: data });
        toast({
          title: "Success",
          description: "Location created successfully",
        });
      }
      // Invalidate and refetch the locations query
      await queryClient.invalidateQueries({ queryKey: ["/company/location"] });
      setDialogOpen(null);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingItem ? 'update' : 'create'} location`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentCategorySubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      if (editingItem) {
        await apiCall(`/assets/equipment_category/${editingItem.id}`, { method: 'PUT', body: data });
        toast({
          title: "Success",
          description: "Equipment category updated successfully",
        });
      } else {
        await apiCall("/assets/equipment_category", { method: 'POST', body: data });
        toast({
          title: "Success",
          description: "Equipment category created successfully",
        });
      }
      // Invalidate and refetch the equipment categories query
      await queryClient.invalidateQueries({ queryKey: ["/assets/equipment_category"] });
      setDialogOpen(null);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingItem ? 'update' : 'create'} equipment category`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentCategorySubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      if (editingItem) {
        await apiCall(`/assets/attachment_category/${editingItem.id}`, { method: 'PUT', body: data });
        toast({
          title: "Success",
          description: "Attachment category updated successfully",
        });
      } else {
        await apiCall("/assets/attachment_category", { method: 'POST', body: data });
        toast({
          title: "Success",
          description: "Attachment category created successfully",
        });
      }
      // Invalidate and refetch the attachment categories query
      await queryClient.invalidateQueries({ queryKey: ["/assets/attachment_category"] });
      setDialogOpen(null);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingItem ? 'update' : 'create'} attachment category`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWorkOrderStatusSubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      if (editingItem) {
        await apiCall(`/work-orders/status/${editingItem.id}`, { method: 'PUT', body: data });
        toast({
          title: "Success",
          description: "Work order status updated successfully",
        });
      } else {
        await apiCall("/work-orders/status", { method: 'POST', body: data });
        toast({
          title: "Success",
          description: "Work order status created successfully",
        });
      }
      // Invalidate and refetch the work order status query
      await queryClient.invalidateQueries({ queryKey: ["/work-orders/status"] });
      setDialogOpen(null);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingItem ? 'update' : 'create'} work order status`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWeightClassSubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      if (editingItem) {
        await apiCall(`/assets/equipment_weight_class/${editingItem.id}`, { method: 'PUT', body: data });
        toast({
          title: "Success",
          description: "Weight class updated successfully",
        });
      } else {
        await apiCall("/assets/equipment_weight_class", { method: 'POST', body: data });
        toast({
          title: "Success",
          description: "Weight class created successfully",
        });
      }
      // Invalidate and refetch the weight class query
      await queryClient.invalidateQueries({ queryKey: ["/assets/equipment_weight_class"] });
      setDialogOpen(null);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingItem ? 'update' : 'create'} weight class`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      if (editingItem) {
        await apiCall(`/projects/projects/${editingItem.id}`, { method: 'PUT', body: data });
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        await apiCall("/projects/projects", { method: 'POST', body: data });
        toast({
          title: "Success",
          description: "Project created successfully",
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["/projects/projects"] });
      setDialogOpen(null);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingItem ? 'update' : 'create'} project`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountCodeSubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      if (editingItem) {
        await apiCall(`/projects/account-codes/${editingItem.id}`, { method: 'PUT', body: data });
        toast({
          title: "Success",
          description: "Account code updated successfully",
        });
      } else {
        await apiCall("/projects/account-codes", { method: 'POST', body: data });
        toast({
          title: "Success",
          description: "Account code created successfully",
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["/projects/account-codes"] });
      setDialogOpen(null);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingItem ? 'update' : 'create'} account code`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJobCodeSubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      if (editingItem) {
        await apiCall(`/projects/job-codes/${editingItem.id}`, { method: 'PUT', body: data });
        toast({
          title: "Success",
          description: "Job code updated successfully",
        });
      } else {
        await apiCall("/projects/job-codes", { method: 'POST', body: data });
        toast({
          title: "Success",
          description: "Job code created successfully",
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["/projects/job-codes"] });
      setDialogOpen(null);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingItem ? 'update' : 'create'} job code`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssetStatusSubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      if (editingItem) {
        await apiCall(`/projects/asset-statuses/${editingItem.id}`, { method: 'PUT', body: data });
        toast({
          title: "Success",
          description: "Asset status updated successfully",
        });
      } else {
        await apiCall("/projects/asset-statuses", { method: 'POST', body: data });
        toast({
          title: "Success",
          description: "Asset status created successfully",
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["/projects/asset-statuses"] });
      setDialogOpen(null);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingItem ? 'update' : 'create'} asset status`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle row clicks for editing
  const handleRowClick = (row: any, type: 'site' | 'location' | 'equipmentCategory' | 'attachmentCategory' | 'workOrderStatus' | 'weightClass' | 'project' | 'accountCode' | 'jobCode' | 'assetStatus') => {
    setEditingItem(row);
    setDialogOpen(type);
  };

  // Helper function to prepare initial data for editing (handle nested objects)
  const prepareInitialData = (item: any, fields: any[]) => {
    if (!item) return {};
    
    const initialData: Record<string, any> = { ...item };
    
    // Handle nested objects in dropdowns (convert object to ID)
    fields.forEach(field => {
      if (field.type === 'dropdown' && item[field.name] && typeof item[field.name] === 'object') {
        initialData[field.name] = item[field.name].id || item[field.name];
      }
    });
    
    return initialData;
  };

  const customLayout = useCallback((
    title: string,
    onSubmit: (data: Record<string, any>) => Promise<void>,
    fields: any[]
  ) => (props: any) => (
    <div className="space-y-6">
      <div className="p-4 space-y-4">
        {props.error && (
          <div className="text-red-600 text-sm">{props.error}</div>
        )}
        {fields.map(props.renderField)}
      </div>
      
      <div className="flex justify-end p-4 border-t">
        <Button 
          onClick={(e) => props.handleSubmit(e)} 
          disabled={props.loading}
        >
          {props.loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  ), []);

  return (
    <div className="h-full overflow-x-auto min-w-0">
      <div className="space-y-6 min-w-[1440px]">
        <Tabs defaultValue="sites" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sites">Tables</TabsTrigger>
            <TabsTrigger value="categories">Users</TabsTrigger>
            <TabsTrigger value="workorder-settings">WorkOrder Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sites" className="space-y-3">
            <div className="grid grid-cols-4 gap-4">
              {/* First Column - Sites and Locations */}
              <div className="space-y-4">
                <ApiTable
                  title="Sites"
                  endpoint="/company/site"
                  onCreateNew={() => { setEditingItem(null); setDialogOpen('site'); }}
                  onRowClick={(row) => handleRowClick(row, 'site')}
                  createNewText="New Site"
                  className="h-fit"
                  tableClassName="text-xs"
                  maxHeight="max-h-80"
                  columns={[
                    { key: 'code', header: 'Code' },
                    { key: 'name', header: 'Name' },
                  ]}
                />
                
                <ApiTable
                  title="Locations"
                  endpoint="/company/location"
                  onCreateNew={() => { setEditingItem(null); setDialogOpen('location'); }}
                  onRowClick={(row) => handleRowClick(row, 'location')}
                  createNewText="New Location"
                  className="h-fit"
                  tableClassName="text-xs"
                  maxHeight="max-h-80"
                  columns={[
                    { key: 'site', header: 'Site', type: 'object' },
                    { key: 'name', header: 'Name' },
                    { key: 'slug', header: 'Slug' },
                  ]}
                />
              </div>
              
              {/* Second Column - Equipment and Attachment Categories */}
              <div className="space-y-4">
                <ApiTable
                  title="Equipment Categories"
                  endpoint="/assets/equipment_category"
                  onCreateNew={() => { setEditingItem(null); setDialogOpen('equipmentCategory'); }}
                  onRowClick={(row) => handleRowClick(row, 'equipmentCategory')}
                  createNewText="New Equipment Category"
                  className="h-fit"
                  tableClassName="text-xs"
                  maxHeight="max-h-80"
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'slug', header: 'Slug' },
                  ]}
                />
                
                <ApiTable
                  title="Attachment Categories"
                  endpoint="/assets/attachment_category"
                  onCreateNew={() => { setEditingItem(null); setDialogOpen('attachmentCategory'); }}
                  onRowClick={(row) => handleRowClick(row, 'attachmentCategory')}
                  createNewText="New Attachment Category"
                  className="h-fit"
                  tableClassName="text-xs"
                  maxHeight="max-h-80"
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'slug', header: 'Slug' },
                  ]}
                />
              </div>
              
              {/* Third Column - WorkOrder Status and Weight Class */}
              <div className="space-y-4">
                <ApiTable
                  title="WorkOrder Status"
                  endpoint="/work-orders/status"
                  onCreateNew={() => { setEditingItem(null); setDialogOpen('workOrderStatus'); }}
                  onRowClick={(row) => handleRowClick(row, 'workOrderStatus')}
                  createNewText="Add WorkOrder Status"
                  className="h-fit"
                  tableClassName="text-xs"
                  maxHeight="max-h-80"
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'control', header: 'Control', type: 'object' },
                  ]}
                />
                
                <ApiTable
                  title="Weight Classes"
                  endpoint="/assets/equipment_weight_class"
                  onCreateNew={() => { setEditingItem(null); setDialogOpen('weightClass'); }}
                  onRowClick={(row) => handleRowClick(row, 'weightClass')}
                  createNewText="New Weight Class"
                  className="h-fit"
                  tableClassName="text-xs"
                  maxHeight="max-h-80"
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'weight', header: 'Weight' },
                  ]}
                />
              </div>

              {/* Fourth Column - Project Related Tables */}
              <div className="space-y-4">
                <ApiTable
                  title="Projects"
                  endpoint="/projects/projects"
                  onCreateNew={() => { setEditingItem(null); setDialogOpen('project'); }}
                  onRowClick={(row) => handleRowClick(row, 'project')}
                  createNewText="New Project"
                  className="h-fit"
                  tableClassName="text-xs"
                  maxHeight="max-h-52"
                  columns={[
                    { key: 'name', header: 'Name' },
                  ]}
                />
                
                <ApiTable
                  title="Account Codes"
                  endpoint="/projects/account-codes"
                  onCreateNew={() => { setEditingItem(null); setDialogOpen('accountCode'); }}
                  onRowClick={(row) => handleRowClick(row, 'accountCode')}
                  createNewText="New Account Code"
                  className="h-fit"
                  tableClassName="text-xs"
                  maxHeight="max-h-52"
                  columns={[
                    { key: 'name', header: 'Name' },
                  ]}
                />

                <ApiTable
                  title="Job Codes"
                  endpoint="/projects/job-codes"
                  onCreateNew={() => { setEditingItem(null); setDialogOpen('jobCode'); }}
                  onRowClick={(row) => handleRowClick(row, 'jobCode')}
                  createNewText="New Job Code"
                  className="h-fit"
                  tableClassName="text-xs"
                  maxHeight="max-h-52"
                  columns={[
                    { key: 'name', header: 'Name' },
                  ]}
                />
                
                <ApiTable
                  title="Asset Status"
                  endpoint="/projects/asset-statuses"
                  onCreateNew={() => { setEditingItem(null); setDialogOpen('assetStatus'); }}
                  onRowClick={(row) => handleRowClick(row, 'assetStatus')}
                  createNewText="New Asset Status"
                  className="h-fit"
                  tableClassName="text-xs"
                  maxHeight="max-h-52"
                  columns={[
                    { key: 'name', header: 'Name' },
                  ]}
                />
              </div>
            </div>
          </TabsContent>
          

          <TabsContent value="categories" className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              Equipment and Attachment Categories have been moved to the Sites tab.
            </div>
          </TabsContent>
          
          <TabsContent value="workorder-settings" className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              WorkOrder Status has been moved to the Sites tab.
            </div>
          </TabsContent>
      </Tabs>

      {/* Site Dialog */}
      <Dialog open={dialogOpen === 'site'} onOpenChange={(open) => { if (!open) { setDialogOpen(null); setEditingItem(null); } }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Site' : 'Create New Site'}</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={siteFormFields}
            onSubmit={handleSiteSubmit}
            loading={loading}
            initialData={editingItem ? prepareInitialData(editingItem, siteFormFields) : {}}
            customLayout={customLayout(editingItem ? 'Edit Site' : 'Create New Site', handleSiteSubmit, siteFormFields)}
          />
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={dialogOpen === 'location'} onOpenChange={(open) => { if (!open) { setDialogOpen(null); setEditingItem(null); } }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Location' : 'Create New Location'}</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={locationFormFields}
            onSubmit={handleLocationSubmit}
            loading={loading}
            initialData={editingItem ? prepareInitialData(editingItem, locationFormFields) : {}}
            customLayout={customLayout(editingItem ? 'Edit Location' : 'Create New Location', handleLocationSubmit, locationFormFields)}
          />
        </DialogContent>
      </Dialog>

      {/* Equipment Category Dialog */}
      <Dialog open={dialogOpen === 'equipmentCategory'} onOpenChange={(open) => { if (!open) { setDialogOpen(null); setEditingItem(null); } }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Equipment Category' : 'Create New Equipment Category'}</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={equipmentCategoryFormFields}
            onSubmit={handleEquipmentCategorySubmit}
            loading={loading}
            initialData={editingItem ? prepareInitialData(editingItem, equipmentCategoryFormFields) : {}}
            customLayout={customLayout(editingItem ? 'Edit Equipment Category' : 'Create New Equipment Category', handleEquipmentCategorySubmit, equipmentCategoryFormFields)}
          />
        </DialogContent>
      </Dialog>

      {/* Attachment Category Dialog */}
      <Dialog open={dialogOpen === 'attachmentCategory'} onOpenChange={(open) => { if (!open) { setDialogOpen(null); setEditingItem(null); } }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Attachment Category' : 'Create New Attachment Category'}</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={attachmentCategoryFormFields}
            onSubmit={handleAttachmentCategorySubmit}
            loading={loading}
            initialData={editingItem ? prepareInitialData(editingItem, attachmentCategoryFormFields) : {}}
            customLayout={customLayout(editingItem ? 'Edit Attachment Category' : 'Create New Attachment Category', handleAttachmentCategorySubmit, attachmentCategoryFormFields)}
          />
        </DialogContent>
      </Dialog>

      {/* Work Order Status Dialog */}
      <Dialog open={dialogOpen === 'workOrderStatus'} onOpenChange={(open) => { if (!open) { setDialogOpen(null); setEditingItem(null); } }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit WorkOrder Status' : 'Add WorkOrder Status'}</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={workOrderStatusFormFields}
            onSubmit={handleWorkOrderStatusSubmit}
            loading={loading}
            initialData={editingItem ? prepareInitialData(editingItem, workOrderStatusFormFields) : {}}
            customLayout={customLayout(editingItem ? 'Edit WorkOrder Status' : 'Add WorkOrder Status', handleWorkOrderStatusSubmit, workOrderStatusFormFields)}
          />
        </DialogContent>
      </Dialog>

      {/* Weight Class Dialog */}
      <Dialog open={dialogOpen === 'weightClass'} onOpenChange={(open) => { if (!open) { setDialogOpen(null); setEditingItem(null); } }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Weight Class' : 'Create New Weight Class'}</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={weightClassFormFields}
            onSubmit={handleWeightClassSubmit}
            loading={loading}
            initialData={editingItem ? prepareInitialData(editingItem, weightClassFormFields) : {}}
            customLayout={customLayout(editingItem ? 'Edit Weight Class' : 'Create New Weight Class', handleWeightClassSubmit, weightClassFormFields)}
          />
        </DialogContent>
      </Dialog>

      {/* Project Dialog */}
      <Dialog open={dialogOpen === 'project'} onOpenChange={(open) => { if (!open) { setDialogOpen(null); setEditingItem(null); } }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={projectFormFields}
            onSubmit={handleProjectSubmit}
            loading={loading}
            initialData={editingItem ? prepareInitialData(editingItem, projectFormFields) : {}}
            customLayout={customLayout(editingItem ? 'Edit Project' : 'Create New Project', handleProjectSubmit, projectFormFields)}
          />
        </DialogContent>
      </Dialog>

      {/* Account Code Dialog */}
      <Dialog open={dialogOpen === 'accountCode'} onOpenChange={(open) => { if (!open) { setDialogOpen(null); setEditingItem(null); } }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Account Code' : 'Create New Account Code'}</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={accountCodeFormFields}
            onSubmit={handleAccountCodeSubmit}
            loading={loading}
            initialData={editingItem ? prepareInitialData(editingItem, accountCodeFormFields) : {}}
            customLayout={customLayout(editingItem ? 'Edit Account Code' : 'Create New Account Code', handleAccountCodeSubmit, accountCodeFormFields)}
          />
        </DialogContent>
      </Dialog>

      {/* Job Code Dialog */}
      <Dialog open={dialogOpen === 'jobCode'} onOpenChange={(open) => { if (!open) { setDialogOpen(null); setEditingItem(null); } }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Job Code' : 'Create New Job Code'}</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={jobCodeFormFields}
            onSubmit={handleJobCodeSubmit}
            loading={loading}
            initialData={editingItem ? prepareInitialData(editingItem, jobCodeFormFields) : {}}
            customLayout={customLayout(editingItem ? 'Edit Job Code' : 'Create New Job Code', handleJobCodeSubmit, jobCodeFormFields)}
          />
        </DialogContent>
      </Dialog>

      {/* Asset Status Dialog */}
      <Dialog open={dialogOpen === 'assetStatus'} onOpenChange={(open) => { if (!open) { setDialogOpen(null); setEditingItem(null); } }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Asset Status' : 'Create New Asset Status'}</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={assetStatusFormFields}
            onSubmit={handleAssetStatusSubmit}
            loading={loading}
            initialData={editingItem ? prepareInitialData(editingItem, assetStatusFormFields) : {}}
            customLayout={customLayout(editingItem ? 'Edit Asset Status' : 'Create New Asset Status', handleAssetStatusSubmit, assetStatusFormFields)}
          />
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default Settings;