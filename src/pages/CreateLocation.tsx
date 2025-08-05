import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiCall } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { handleApiError } from "@/utils/errorHandling";
import { StandardFormLayout } from "@/components/layout/StandardFormLayout";
import { locationFormFields } from "@/data/siteFormFields";

const CreateLocation = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall("/company/location", { method: "POST", body: data });
      toast({
        title: "Success",
        description: "Location created successfully!",
      });
      navigate("/settings");
    } catch (error: any) {
      handleApiError(error, "Creation Failed");
    }
  };

  return (
    <div className="space-y-6">
      <ApiForm
        fields={locationFormFields}
        onSubmit={handleSubmit}
        customLayout={({
          handleSubmit: handleFormSubmit,
          renderField,
          loading,
        }) => (
          <StandardFormLayout
            title="Location Information"
            backRoute="/settings"
            onSave={handleFormSubmit}
            loading={loading}
          >
            {locationFormFields.map(renderField)}
          </StandardFormLayout>
        )}
      />
    </div>
  );
};

export default CreateLocation;
