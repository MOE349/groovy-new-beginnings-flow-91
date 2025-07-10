import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ApiTable from "@/components/ApiTable";
import ApiForm from "@/components/ApiForm";
import { siteFormFields, locationFormFields } from "@/data/siteFormFields";
import { equipmentCategoryFormFields, attachmentCategoryFormFields } from "@/data/categoryFormFields";
import { apiPost } from "@/utils/apis";

const Settings = () => {
  const [dialogOpen, setDialogOpen] = useState<'site' | 'location' | 'equipmentCategory' | 'attachmentCategory' | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSiteSubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      await apiPost("/company/site", data);
      toast({
        title: "Success",
        description: "Site created successfully",
      });
      setDialogOpen(null);
      // The table will automatically refresh due to React Query
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create site",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      await apiPost("/company/location", data);
      toast({
        title: "Success",
        description: "Location created successfully",
      });
      setDialogOpen(null);
      // The table will automatically refresh due to React Query
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create location",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentCategorySubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      await apiPost("/assets/equipment_category", data);
      toast({
        title: "Success",
        description: "Equipment category created successfully",
      });
      setDialogOpen(null);
      // The table will automatically refresh due to React Query
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create equipment category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentCategorySubmit = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      await apiPost("/assets/attachment_category", data);
      toast({
        title: "Success",
        description: "Attachment category created successfully",
      });
      setDialogOpen(null);
      // The table will automatically refresh due to React Query
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create attachment category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-6">
      <Tabs defaultValue="sites" className="w-full mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sites">Sites</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="workorder-settings">WorkOrder Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sites" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApiTable
              title="Sites"
              endpoint="/company/site"
              onCreateNew={() => setDialogOpen('site')}
              createNewText="New Site"
              columns={[
                { key: 'code', header: 'Code' },
                { key: 'name', header: 'Name' },
              ]}
            />
            
            <ApiTable
              title="Locations"
              endpoint="/company/location"
              onCreateNew={() => setDialogOpen('location')}
              createNewText="New Location"
              columns={[
                { key: 'site', header: 'Site', type: 'object' },
                { key: 'name', header: 'Name' },
                { key: 'slug', header: 'Slug' },
              ]}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApiTable
              title="Equipment Categories"
              endpoint="/assets/equipment_category"
              onCreateNew={() => setDialogOpen('equipmentCategory')}
              createNewText="New Equipment Category"
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'slug', header: 'Slug' },
              ]}
            />
            
            <ApiTable
              title="Attachment Categories"
              endpoint="/assets/attachment_category"
              onCreateNew={() => setDialogOpen('attachmentCategory')}
              createNewText="New Attachment Category"
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'slug', header: 'Slug' },
              ]}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="workorder-settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApiTable
              title="WorkOrder Status"
              endpoint="/work-orders/status"
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'control', header: 'Control', type: 'object' },
              ]}
            />
            
            <ApiForm
              title="Add WorkOrder Status"
              fields={[
                {
                  name: "control",
                  type: "dropdown",
                  label: "Control",
                  required: true,
                  endpoint: "/work-orders/controls",
                  optionValueKey: "id",
                  optionLabelKey: "name"
                },
                {
                  name: "name",
                  type: "input",
                  label: "Name",
                  required: true,
                  inputType: "text"
                }
              ]}
              submitText="Add Status"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Site Dialog */}
      <Dialog open={dialogOpen === 'site'} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Site</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={siteFormFields}
            onSubmit={handleSiteSubmit}
            loading={loading}
            customLayout={customLayout("Create New Site", handleSiteSubmit, siteFormFields)}
          />
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={dialogOpen === 'location'} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Location</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={locationFormFields}
            onSubmit={handleLocationSubmit}
            loading={loading}
            customLayout={customLayout("Create New Location", handleLocationSubmit, locationFormFields)}
          />
        </DialogContent>
      </Dialog>

      {/* Equipment Category Dialog */}
      <Dialog open={dialogOpen === 'equipmentCategory'} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Equipment Category</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={equipmentCategoryFormFields}
            onSubmit={handleEquipmentCategorySubmit}
            loading={loading}
            customLayout={customLayout("Create New Equipment Category", handleEquipmentCategorySubmit, equipmentCategoryFormFields)}
          />
        </DialogContent>
      </Dialog>

      {/* Attachment Category Dialog */}
      <Dialog open={dialogOpen === 'attachmentCategory'} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Attachment Category</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={attachmentCategoryFormFields}
            onSubmit={handleAttachmentCategorySubmit}
            loading={loading}
            customLayout={customLayout("Create New Attachment Category", handleAttachmentCategorySubmit, attachmentCategoryFormFields)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;