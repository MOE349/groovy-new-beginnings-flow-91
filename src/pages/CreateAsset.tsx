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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Asset</h1>
          <p className="text-muted-foreground">
            Choose the type of asset you want to create
          </p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Select Asset Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setAssetType("equipment")} 
                className="w-full"
                variant="outline"
              >
                Create Equipment
              </Button>
              <Button 
                onClick={() => setAssetType("attachment")} 
                className="w-full"
                variant="outline"
              >
                Create Attachment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentFields = assetType === "equipment" ? equipmentFields : attachmentFields;
  const assetTypeName = assetType === "equipment" ? "Equipment" : "Attachment";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New {assetTypeName}</h1>
          <p className="text-muted-foreground">
            Add a new {assetTypeName.toLowerCase()} to your asset management system
          </p>
        </div>
        <Button variant="outline" onClick={() => setAssetType(null)}>
          Change Type
        </Button>
      </div>

      <div className="max-w-2xl">
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
  );
};

export default CreateAsset;