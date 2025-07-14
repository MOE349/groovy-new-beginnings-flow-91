import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiCall } from "@/utils/apis";
import { equipmentFields, attachmentFields } from "@/data/assetFormFields";

const CreateAsset = () => {
  const navigate = useNavigate();
  const [assetType, setAssetType] = useState<"equipment" | "attachment" | null>(null);

  const handleSubmit = async (data: Record<string, any>) => {
    if (!assetType) return;
    
    try {
      const endpoint = assetType === "equipment" ? "/assets/equipments" : "/assets/attachments";
      await apiCall(endpoint, { method: 'POST', body: data });
      toast({
        title: "Success",
        description: `${assetType === "equipment" ? "Equipment" : "Attachment"} created successfully!`,
      });
      navigate("/asset");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to create ${assetType}`,
        variant: "destructive",
      });
    }
  };

  if (!assetType) {
    return (
      <div className="px-6 space-y-4 min-w-0">
        <div className="h-14 flex items-center justify-between px-4 py-2 bg-card border-b border-border">
          <div>
            <h1 className="text-h3 font-medium text-primary">Create New Asset</h1>
            <p className="text-caption text-muted-foreground">
              Choose the type of asset you want to create
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <div className="bg-card rounded-md shadow-sm px-2 py-1">
            <h3 className="text-h3 font-medium mb-4 text-primary">Select Asset Type</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => setAssetType("equipment")} 
                className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                variant="default"
              >
                Create Equipment
              </Button>
              <Button 
                onClick={() => setAssetType("attachment")} 
                className="w-full h-12"
                variant="outline"
              >
                Create Attachment
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentFields = assetType === "equipment" ? equipmentFields : attachmentFields;
  const assetTypeName = assetType === "equipment" ? "Equipment" : "Attachment";

  const customLayout = ({ handleSubmit, formData, handleFieldChange, loading, error, renderField }: any) => (
    <div className="space-y-0">
      {/* Top Bar - Height 3.5rem */}
      <div className="h-14 flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <Button 
          variant="ghost" 
          onClick={() => setAssetType(null)}
          className="flex items-center gap-2 text-foreground hover:text-accent"
        >
          Change Type
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6"
        >
          {loading ? "Loading..." : `Create ${assetTypeName}`}
        </Button>
      </div>
      
      {/* Equipment Information Card - Compact */}
      <div className="bg-card rounded-md shadow-sm px-2 py-1 mt-4">
        <form onSubmit={handleSubmit} className="h-full">
          <div 
            className="flex items-center gap-4 mb-4 py-1 -mx-2 bg-muted-foreground/20 border border-border rounded-md"
          >
            <h3 className="text-h3 font-medium text-primary ml-6">{assetTypeName} Information</h3>
          </div>
          
          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 -mt-2">
            {/* Left Column - 35% - Online toggle + image + location */}
            <div className="lg:col-span-4 space-y-3 flex flex-col">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={formData?.is_online || false} 
                  onCheckedChange={(checked) => handleFieldChange("is_online", checked)}
                />
                <Label className="text-caption font-normal">Online</Label>
              </div>
              <div className="w-full h-32 bg-muted rounded border overflow-hidden">
                <img 
                  src="/lovable-uploads/cf9d21df-6820-4bea-ae16-54c41a67117e.png" 
                  alt="Equipment" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-caption font-normal text-right w-24 text-foreground">Location</label>
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
            
            {/* Right Column - 65% - Two sub-columns for fields */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2">
                {/* First sub-column */}
                <div className="p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 before:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Code</label>
                    <div className="flex-grow">
                      {renderField({ name: "code", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Name</label>
                    <div className="flex-grow">
                      {renderField({ name: "name", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0 pt-1">Description</label>
                    <div className="flex-grow">
                      {renderField({ name: "description", type: "textarea", rows: 4 })}
                    </div>
                  </div>
                  {assetType === "attachment" && (
                    <div className="flex items-start gap-2 h-10">
                      <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-0">Equipment</label>
                      <div className="flex-grow">
                        {renderField({ name: "equipment", type: "dropdown", endpoint: "/assets/equipments", queryKey: ["assets_equipments"], optionValueKey: "id", optionLabelKey: "name" })}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Second sub-column */}
                <div className="p-6 space-y-2 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl">
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-0">Category</label>
                    <div className="flex-grow">
                      {renderField({ 
                        name: "category", 
                        type: "dropdown", 
                        required: true, 
                        endpoint: assetType === "equipment" ? "/assets/equipment_category" : "/assets/attachment_category",
                        queryKey: assetType === "equipment" ? ["equipment_category"] : ["attachment_category"],
                        optionValueKey: "id", 
                        optionLabelKey: "name"
                      })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Make</label>
                    <div className="flex-grow">
                      {renderField({ name: "make", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Model</label>
                    <div className="flex-grow">
                      {renderField({ name: "model", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-2.5">Serial #</label>
                    <div className="flex-grow">
                      {renderField({ name: "serial_number", type: "input", required: true, inputType: "text" })}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 h-10">
                    <label className="block text-caption font-normal text-right w-24 text-foreground shrink-0 pt-0">Project</label>
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
    <div className="h-full overflow-x-auto min-w-0">
      <div className="space-y-6 min-w-[1440px]">
        <div>
          <ApiForm
            fields={currentFields}
            onSubmit={handleSubmit}
            initialData={{
              is_online: false,
            }}
            customLayout={customLayout}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateAsset;