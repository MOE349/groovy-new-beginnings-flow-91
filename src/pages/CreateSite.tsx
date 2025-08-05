import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiCall } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { handleApiError } from "@/utils/errorHandling";
import { StandardFormLayout } from "@/components/layout/StandardFormLayout";
import { siteFormFields } from "@/data/siteFormFields";

const CreateSite = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall("/company/site", { method: "POST", body: data });
      toast({
        title: "Success",
        description: "Site created successfully!",
      });
      navigate("/settings");
    } catch (error: any) {
      handleApiError(error, "Creation Failed");
    }
  };

  return (
    <div className="space-y-6">
      <ApiForm
        fields={siteFormFields}
        onSubmit={handleSubmit}
        customLayout={({
          handleSubmit: handleFormSubmit,
          renderField,
          loading,
        }) => (
          <StandardFormLayout
            title="Site Information"
            backRoute="/settings"
            onSave={handleFormSubmit}
            loading={loading}
          >
            {siteFormFields.map(renderField)}
          </StandardFormLayout>
        )}
      />
    </div>
  );
};

export default CreateSite;
