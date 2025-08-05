import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiCall } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { StandardFormLayout } from "@/components/layout/StandardFormLayout";
import { equipmentCategoryFormFields } from "@/data/categoryFormFields";

const CreateEquipmentCategory = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall("/assets/equipment_category", {
        method: "POST",
        body: data,
      });
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
      <ApiForm
        fields={equipmentCategoryFormFields}
        onSubmit={handleSubmit}
        customLayout={({
          handleSubmit: handleFormSubmit,
          renderField,
          loading,
        }) => (
          <StandardFormLayout
            title="Equipment Category Information"
            backRoute="/settings"
            onSave={handleFormSubmit}
            loading={loading}
          >
            {equipmentCategoryFormFields.map(renderField)}
          </StandardFormLayout>
        )}
      />
    </div>
  );
};

export default CreateEquipmentCategory;
