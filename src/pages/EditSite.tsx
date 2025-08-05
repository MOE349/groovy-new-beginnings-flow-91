import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiCall } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { StandardFormLayout } from "@/components/layout/StandardFormLayout";
import { siteFormFields } from "@/data/siteFormFields";

const EditSite = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: site, isLoading } = useQuery({
    queryKey: ["site", id],
    queryFn: async () => {
      const response = await apiCall(`/company/site/${id}`);
      return response.data.data || response.data;
    },
    enabled: !!id,
  });

  const handleSubmit = async (data: Record<string, any>) => {
    if (!id) return;

    try {
      await apiCall(`/company/site/${id}`, { method: "PATCH", body: data });
      toast({
        title: "Success",
        description: "Site updated successfully!",
      });
      navigate("/settings");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update site",
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
        fields={siteFormFields}
        onSubmit={handleSubmit}
        initialData={site}
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

export default EditSite;
