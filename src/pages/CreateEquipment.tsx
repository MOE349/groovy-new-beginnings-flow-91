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
import { ArrowLeft, Check, X } from "lucide-react";

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
      <div className="h-10 flex items-center justify-between px-4 py-1 bg-secondary border-b border-border">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/assets")}
          className="flex items-center gap-2 text-secondary-foreground hover:text-secondary-foreground/80 hover:bg-secondary-foreground/10"
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
      
      {/* Equipment Information Card - Compact */}
      <div className="bg-card rounded-md shadow-sm px-2 py-1 mt-4">
        <form onSubmit={handleSubmit} className="h-full">
          <div 
            className="flex items-center gap-4 mb-4 py-1 -mx-2 bg-slate-200 border border-border rounded-md"
          >
            <h3 className="text-h3 font-medium text-primary ml-6">Equipment Information</h3>
            {(formData?.code || formData?.name) && (
              <span className="text-h3 font-medium text-muted-foreground ml-16">
                {formData?.code && `(${formData.code})`} {formData?.name}
              </span>
            )}
          </div>
          
          {/* Layout matching reference image */}
          <div className="flex gap-8 items-center -mt-2">
            {/* Left Section - Image, toggle, location */}
            <div className="flex flex-col space-y-3 w-64 pl-6">
              <div className="flex items-center space-x-0">
                <div 
                  className={`flex items-center cursor-pointer transition-all duration-300 rounded border w-48 h-8 ${
                    formData?.is_online 
                      ? 'bg-green-500 border-green-600' 
                      : 'bg-red-500 border-red-600'
                  }`}
                  onClick={() => handleFieldChange("is_online", !formData?.is_online)}
                >
                  {/* Icon section */}
                  <div className="flex items-center justify-center w-8 h-full text-white">
                    {formData?.is_online ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                  </div>
                  
                  {/* Status text */}
                  <div className="flex-1 text-sm font-medium text-white text-center">
                    {formData?.is_online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              <div className="w-48 h-32 bg-muted rounded border overflow-hidden">
                <img 
                  src="/lovable-uploads/cf9d21df-6820-4bea-ae16-54c41a67117e.png" 
                  alt="Equipment" 
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