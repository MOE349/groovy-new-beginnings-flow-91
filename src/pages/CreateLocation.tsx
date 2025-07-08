import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiPost } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { locationFormFields } from "@/data/siteFormFields";

const CreateLocation = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiPost("/company/location", data);
      toast({
        title: "Success",
        description: "Location created successfully!",
      });
      navigate("/settings");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create location",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Location</h1>
        <p className="text-muted-foreground">
          Add a new location to your organization
        </p>
      </div>
      
      <ApiForm
        fields={locationFormFields}
        title="Location Information"
        onSubmit={handleSubmit}
        submitText="Create Location"
        className="max-w-2xl"
      />
    </div>
  );
};

export default CreateLocation;