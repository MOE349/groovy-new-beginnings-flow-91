import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiPost } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { attachmentCategoryFormFields } from "@/data/categoryFormFields";

const CreateAttachmentCategory = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiPost("/assets/attachment_category", data);
      toast({
        title: "Success",
        description: "Attachment category created successfully!",
      });
      navigate("/settings");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create attachment category",
        variant: "destructive",
      });
    }
  };

  const customLayout = ({ handleSubmit, formData, handleFieldChange, loading, error, renderField }: any) => (
    <div className="space-y-0">
      {/* Top Bar */}
      <div className="h-10 flex items-center justify-between px-4 py-1 bg-secondary border-b border-border">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 text-black dark:text-black hover:scale-105 transition-transform px-4 py-1 h-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90 px-4 py-1 h-8 text-sm font-medium shadow-lg border border-secondary-foreground/20 hover:shadow-md transition-all duration-200"
          style={{
            boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          {loading ? "Loading..." : "Save"}
        </Button>
      </div>
      
      {/* Form Card */}
      <div className="bg-card rounded-md shadow-sm px-2 py-1 mt-4 max-w-2xl">
        <form onSubmit={handleSubmit} className="h-full">
          <div 
            className="flex items-center gap-4 mb-4 py-1 -mx-2 bg-accent/20 border border-accent/30 rounded-md" 
          >
            <h3 className="text-h3 font-medium text-primary ml-6">Attachment Category Information</h3>
          </div>
          <div className="space-y-4">
            {attachmentCategoryFormFields.map(renderField)}
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <ApiForm
        fields={attachmentCategoryFormFields}
        onSubmit={handleSubmit}
        customLayout={customLayout}
      />
    </div>
  );
};

export default CreateAttachmentCategory;