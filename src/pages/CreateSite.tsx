import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiPost } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { Button } from "@/components/ui/button";
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

  const customLayout = ({ handleSubmit, formData, handleFieldChange, loading, error, renderField }: any) => (
    <div className="px-6 space-y-0">
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div>
          <h1 className="text-h3 font-medium text-primary">Create Site</h1>
          <p className="text-caption text-muted-foreground">
            Add a new site to your organization
          </p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6"
        >
          {loading ? "Loading..." : "Create Site"}
        </Button>
      </div>
      
      {/* Form Card */}
      <div className="bg-card rounded-md shadow-sm px-2 py-1 max-w-2xl">
        <form onSubmit={handleSubmit} className="h-full">
          <h3 className="text-h3 font-medium mb-4 text-primary">Site Information</h3>
          <div className="space-y-4">
            {siteFormFields.map(renderField)}
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <ApiForm
        fields={siteFormFields}
        onSubmit={handleSubmit}
        customLayout={customLayout}
      />
    </div>
  );
};

export default CreateSite;