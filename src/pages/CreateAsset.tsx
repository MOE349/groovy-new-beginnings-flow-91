import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/utils/apis";
import { equipmentFields, attachmentFields } from "@/data/assetFormFields";

const CreateAsset = () => {
  const navigate = useNavigate();
  const [assetType, setAssetType] = useState<"equipment" | "attachment" | null>(null);

  const handleSubmit = async (data: Record<string, any>) => {
    if (!assetType) return;
    
    try {
      const endpoint = assetType === "equipment" ? "/assets/equipments" : "/assets/attachments";
      await apiPost(endpoint, data);
      toast({
        title: "Success",
        description: `${assetType === "equipment" ? "Equipment" : "Attachment"} created successfully!`,
      });
      navigate("/assets");
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
      <div className="px-6 space-y-4">
        <div className="h-14 flex items-center justify-between px-4 py-2 bg-card border-b border-border">
          <div>
            <h1 className="text-h3 font-medium text-primary">Create New Asset</h1>
            <p className="text-caption text-muted-foreground">
              Choose the type of asset you want to create
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <div className="bg-card rounded-md shadow-sm p-4">
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

  return (
    <div className="px-6 space-y-0">
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div>
          <h1 className="text-h3 font-medium text-primary">Create New {assetTypeName}</h1>
          <p className="text-caption text-muted-foreground">
            Add a new {assetTypeName.toLowerCase()} to your asset management system
          </p>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => setAssetType(null)}
          className="text-foreground hover:text-accent"
        >
          Change Type
        </Button>
      </div>

      <div className="max-w-4xl">
        <div className="bg-card rounded-md shadow-sm p-4">
          <ApiForm
            fields={currentFields}
            title={`${assetTypeName} Information`}
            onSubmit={handleSubmit}
            submitText={`Create ${assetTypeName}`}
            initialData={{
              is_online: false,
            }}
            customLayout={({ handleSubmit, formData, handleFieldChange, loading, error, renderField }) => (
              <div className="space-y-4">
                <h3 className="text-h3 font-medium mb-4 text-primary">{assetTypeName} Information</h3>
                
                {/* 2-Column Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
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
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Code</label>
                          <div className="flex-grow">
                            {renderField({ name: "code", type: "input", required: true, inputType: "text" })}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Name</label>
                          <div className="flex-grow">
                            {renderField({ name: "name", type: "input", required: true, inputType: "text" })}
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0 pt-1">Description</label>
                          <div className="flex-grow">
                            {renderField({ name: "description", type: "textarea", rows: 2 })}
                          </div>
                        </div>
                        {assetType === "attachment" && (
                          <div className="flex items-center space-x-2">
                            <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Equipment</label>
                            <div className="flex-grow">
                              {renderField({ name: "equipment", type: "dropdown", endpoint: "/assets/equipments", queryKey: ["assets_equipments"], optionValueKey: "id", optionLabelKey: "name" })}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Second sub-column */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Category</label>
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
                        <div className="flex items-center space-x-2">
                          <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Make</label>
                          <div className="flex-grow">
                            {renderField({ name: "make", type: "input", required: true, inputType: "text" })}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Model</label>
                          <div className="flex-grow">
                            {renderField({ name: "model", type: "input", required: true, inputType: "text" })}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="block text-caption font-normal text-right w-20 text-foreground shrink-0">Serial #</label>
                          <div className="flex-grow">
                            {renderField({ name: "serial_number", type: "input", required: true, inputType: "text" })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  >
                    {loading ? "Loading..." : `Create ${assetTypeName}`}
                  </Button>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateAsset;