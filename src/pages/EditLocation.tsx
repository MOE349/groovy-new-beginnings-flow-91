import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiCall } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { StandardFormLayout } from "@/components/layout/StandardFormLayout";
import { locationFormFields } from "@/data/siteFormFields";

const EditLocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: location, isLoading } = useQuery({
    queryKey: ["location", id],
    queryFn: async () => {
      const response = await apiCall(`/company/location/${id}`);
      return response.data.data || response.data;
    },
    enabled: !!id,
  });

  const handleSubmit = async (data: Record<string, any>) => {
    if (!id) return;

    try {
      await apiCall(`/company/location/${id}`, { method: "PATCH", body: data });
      toast({
        title: "Success",
        description: "Location updated successfully!",
      });
      navigate("/settings");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update location",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ApiForm
        fields={locationFormFields}
        onSubmit={handleSubmit}
        initialData={location}
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

export default EditLocation;
