import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          />
        </div>
      </div>
    </div>
  );
};

export default CreateAsset;