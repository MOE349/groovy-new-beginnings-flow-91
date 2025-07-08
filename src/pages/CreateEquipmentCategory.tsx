import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiPost } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { equipmentCategoryFormFields } from "@/data/categoryFormFields";

const CreateEquipmentCategory = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiPost("/assets/equipment_category", data);
      toast({
        title: "Success",
        description: "Equipment category created successfully!",
      });
      navigate("/settings");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create equipment category",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Equipment Category</h1>
        <p className="text-muted-foreground">
          Add a new equipment category
        </p>
      </div>
      
      <ApiForm
        fields={equipmentCategoryFormFields}
        title="Equipment Category Information"
        onSubmit={handleSubmit}
        submitText="Create Equipment Category"
        className="max-w-2xl"
      />
    </div>
  );
};

export default CreateEquipmentCategory;