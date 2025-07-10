import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ApiTable from "@/components/ApiTable";
import ApiForm from "@/components/ApiForm";

const Settings = () => {
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
              createNewHref="/settings/sites/new"
              createNewText="New Site"
              columns={[
                { key: 'code', header: 'Code' },
                { key: 'name', header: 'Name' },
              ]}
            />
            
            <ApiTable
              title="Locations"
              endpoint="/company/location"
              createNewHref="/settings/locations/new"
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
              createNewHref="/settings/equipment-categories/new"
              createNewText="New Equipment Category"
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'slug', header: 'Slug' },
              ]}
            />
            
            <ApiTable
              title="Attachment Categories"
              endpoint="/assets/attachment_category"
              createNewHref="/settings/attachment-categories/new"
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
    </div>
  );
};

export default Settings;