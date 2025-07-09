import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import ApiTable from "@/components/ApiTable";
import { apiPost } from "@/utils/apis";
import { equipmentFields } from "@/data/assetFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

  const customLayout = ({ handleSubmit, formData, handleFieldChange, loading, error, renderField }: any) => (
    <div className="space-y-0">
      {/* Top Bar - Height 3.5rem */}
      <div className="h-14 flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/assets")}
          className="flex items-center gap-2 text-foreground hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6"
        >
          {loading ? "Loading..." : "Save"}
        </Button>
      </div>
      
      {/* Equipment Information Card - Compact */}
      <div className="bg-card rounded-md shadow-sm px-2 py-1">
        <form onSubmit={handleSubmit} className="h-full">
          <h3 className="text-h3 font-medium mb-4 text-primary">Equipment Information</h3>
          
          {/* Layout matching reference image */}
          <div className="flex gap-8 items-center">
            {/* Left Section - Image, toggle, location */}
            <div className="flex flex-col space-y-3 w-64 pl-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={formData?.is_online || false} 
                  onCheckedChange={(checked) => handleFieldChange("is_online", checked)}
                />
                <Label className="text-caption font-normal">Online</Label>
              </div>
              <div className="w-48 h-32 bg-muted rounded border overflow-hidden">
                <img 
                  src="/lovable-uploads/cf9d21df-6820-4bea-ae16-54c41a67117e.png" 
                  alt="Equipment" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 w-48">
                <label className="block text-caption font-normal text-foreground">Location</label>
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
            
            {/* Right Section - Form fields in three columns */}
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                {/* First sub-column */}
                <div className="p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Code</label>
                    <div className="flex-grow">
                      {renderField({ name: "code", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Name</label>
                    <div className="flex-grow">
                      {renderField({ name: "name", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2">Description</label>
                    <div className="flex-grow">
                      {renderField({ name: "description", type: "textarea", rows: 4 })}
                    </div>
                  </div>
                </div>
                
                {/* Second sub-column */}
                <div className="p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Category</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "category", 
                        type: "dropdown", 
                        required: true, 
                        endpoint: "/assets/equipment_category", 
                        queryKey: ["equipment_category"], 
                        optionValueKey: "id", 
                        optionLabelKey: "name"
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Make</label>
                    <div className="flex-grow">
                      {renderField({ name: "make", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Model</label>
                    <div className="flex-grow">
                      {renderField({ name: "model", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Serial #</label>
                    <div className="flex-grow">
                      {renderField({ name: "serial_number", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                </div>
                
                {/* Third sub-column */}
                <div className="p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Status</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "status", 
                        type: "dropdown",
                        required: true,
                        options: [
                          { id: "active", name: "Active" },
                          { id: "inactive", name: "Inactive" },
                          { id: "maintenance", name: "Under Maintenance" },
                          { id: "retired", name: "Retired" }
                        ]
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Job Code</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "job_code", 
                        type: "dropdown",
                        options: [
                          { id: "job001", name: "JOB-001" },
                          { id: "job002", name: "JOB-002" },
                          { id: "job003", name: "JOB-003" },
                          { id: "job004", name: "JOB-004" }
                        ]
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Account Code</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "account_code", 
                        type: "dropdown",
                        options: [
                          { id: "acc001", name: "ACC-001" },
                          { id: "acc002", name: "ACC-002" },
                          { id: "acc003", name: "ACC-003" },
                          { id: "acc004", name: "ACC-004" }
                        ]
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0">Project</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "project", 
                        type: "dropdown",
                        options: [
                          { id: "proj001", name: "Project Alpha" },
                          { id: "proj002", name: "Project Beta" },
                          { id: "proj003", name: "Project Gamma" },
                          { id: "proj004", name: "Project Delta" }
                        ]
                      })}
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
    <div className="space-y-6 bg-secondary p-4 rounded-lg">
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
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Parts/BOM
              </TabsTrigger>
              <TabsTrigger 
                value="metering-events"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Metering/Events
              </TabsTrigger>
              <TabsTrigger 
                value="scheduled-maintenance"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Scheduled Maintenance
              </TabsTrigger>
              <TabsTrigger 
                value="financials"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger 
                value="files"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Files
              </TabsTrigger>
              <TabsTrigger 
                value="backlog"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Backlog
              </TabsTrigger>
              <TabsTrigger 
                value="log"
                className="px-4 py-1 text-caption font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Log
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Content Panels - Compact */}
          <TabsContent value="parts-bom" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Parts/BOM</h3>
              <p className="text-caption text-muted-foreground">Parts and Bill of Materials content will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="metering-events" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <h3 className="text-h3 font-medium text-foreground">Metering/Events</h3>
                <p className="text-caption text-muted-foreground">Create the equipment first, then add meter readings in the edit view.</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="scheduled-maintenance" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Scheduled Maintenance</h3>
              <p className="text-caption text-muted-foreground">Scheduled maintenance content will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="financials" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Financials</h3>
              <p className="text-caption text-muted-foreground">Financial information content will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="files" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Files</h3>
              <p className="text-caption text-muted-foreground">File attachments and documents will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="backlog" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
              <h3 className="text-h3 font-medium text-foreground">Backlog</h3>
              <p className="text-caption text-muted-foreground">Backlog items and tasks will go here</p>
            </div>
          </TabsContent>
          <TabsContent value="log" className="mt-4">
            <div className="bg-card rounded-sm shadow-xs p-4 space-y-4">
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