import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiPost } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { siteFormFields } from "@/data/siteFormFields";

const CreateSite = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiPost("/company/site", data);
      toast({
        title: "Success",
        description: "Site created successfully!",
      });
      navigate("/settings");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create site",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Site</h1>
        <p className="text-muted-foreground">
          Add a new site to your organization
        </p>
      </div>
      
      <ApiForm
        fields={siteFormFields}
        title="Site Information"
        onSubmit={handleSubmit}
        submitText="Create Site"
        className="max-w-2xl"
      />
    </div>
  );
};

export default CreateSite;