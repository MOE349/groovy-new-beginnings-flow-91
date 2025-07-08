import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiGet, apiPut } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { siteFormFields } from "@/data/siteFormFields";

const EditSite = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: site, isLoading } = useQuery({
    queryKey: ["site", id],
    queryFn: async () => {
      const response = await apiGet(`/company/site/${id}`);
      return response.data.data || response.data;
    },
    enabled: !!id,
  });

  const handleSubmit = async (data: Record<string, any>) => {
    if (!id) return;
    
    try {
      await apiPut(`/company/site/${id}`, data);
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
      <div>
        <h1 className="text-3xl font-bold">Edit Site</h1>
        <p className="text-muted-foreground">
          Update site information
        </p>
      </div>
      
      <ApiForm
        fields={siteFormFields}
        title="Site Information"
        onSubmit={handleSubmit}
        submitText="Update Site"
        className="max-w-2xl"
        initialData={site}
      />
    </div>
  );
};

export default EditSite;