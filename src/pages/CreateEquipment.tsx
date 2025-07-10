import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import ApiTable from "@/components/ApiTable";
import { apiPost } from "@/utils/apis";
import { equipmentFields } from "@/data/assetFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssetFormLayout from "@/components/AssetFormLayout";

const CreateEquipment = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiPost("/assets/equipments", data);
      toast({
        title: "Success",
        description: "Equipment created successfully!",
      });
      navigate("/assets");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create equipment",
        variant: "destructive",
      });
    }
  };

  const customLayout = (props: any) => (
    <AssetFormLayout 
      {...props} 
      assetType="equipment"
      assetTypeName="Equipment"
    />
  );

  return (
    <div className="space-y-6">
      <div>
        <ApiForm
          fields={equipmentFields}
          onSubmit={handleSubmit}
          initialData={{
            is_online: false,
          }}
          customLayout={customLayout}
        />
      </div>

      {/* Compact Tabs Section */}
      <div>
        <Tabs defaultValue="parts-bom" className="h-full">
          {/* Compact Pill-Style Tab List */}
          <div className="h-10 overflow-x-auto">
            <TabsList className="grid w-full grid-cols-7 h-10 bg-card border border-border rounded-md p-0">
              <TabsTrigger 
                value="parts-bom" 
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-secondary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-secondary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Parts/BOM
              </TabsTrigger>
              <TabsTrigger 
                value="metering-events"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-secondary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-secondary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Metering/Events
              </TabsTrigger>
              <TabsTrigger 
                value="scheduled-maintenance"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-secondary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-secondary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Scheduled Maintenance
              </TabsTrigger>
              <TabsTrigger 
                value="financials"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-secondary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-secondary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger 
                value="files"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-secondary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-secondary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Files
              </TabsTrigger>
              <TabsTrigger 
                value="backlog"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-secondary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-secondary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Backlog
              </TabsTrigger>
              <TabsTrigger 
                value="log"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-secondary dark:data-[state=active]:text-secondary data-[state=active]:border-b-2 data-[state=active]:border-secondary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Log
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Content Panels - Compact */}
          <TabsContent value="parts-bom" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Parts/BOM</h3>
              <p className="text-caption text-muted-foreground">Parts and Bill of Materials content will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="metering-events" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <h3 className="text-h3 font-medium text-foreground">Metering/Events</h3>
                <p className="text-caption text-muted-foreground">Create the equipment first, then add meter readings in the edit view.</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="scheduled-maintenance" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Scheduled Maintenance</h3>
              <p className="text-caption text-muted-foreground">Scheduled maintenance content will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="financials" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Financials</h3>
              <p className="text-caption text-muted-foreground">Financial information content will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="files" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Files</h3>
              <p className="text-caption text-muted-foreground">File attachments and documents will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="backlog" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Backlog</h3>
              <p className="text-caption text-muted-foreground">Backlog items and tasks will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="log" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Log</h3>
              <p className="text-caption text-muted-foreground">Activity log content will go here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateEquipment;