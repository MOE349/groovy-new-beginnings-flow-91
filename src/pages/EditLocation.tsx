import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiGet, apiPut } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { locationFormFields } from "@/data/siteFormFields";

const EditLocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: location, isLoading } = useQuery({
    queryKey: ["location", id],
    queryFn: async () => {
      const response = await apiGet(`/company/location/${id}`);
      return response.data.data || response.data;
    },
    enabled: !!id,
  });

  const handleSubmit = async (data: Record<string, any>) => {
    if (!id) return;
    
    try {
      await apiPut(`/company/location/${id}`, data);
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
      <div>
        <h1 className="text-3xl font-bold">Edit Location</h1>
        <p className="text-muted-foreground">
          Update location information
        </p>
      </div>
      
      <ApiForm
        fields={locationFormFields}
        title="Location Information"
        onSubmit={handleSubmit}
        submitText="Update Location"
        className="max-w-2xl"
        initialData={location}
      />
    </div>
  );
};

export default EditLocation;