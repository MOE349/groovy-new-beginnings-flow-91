import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiPost } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
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

  return (
    <div className="px-6 space-y-0">
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div>
          <h1 className="text-h3 font-medium text-primary">Create Attachment Category</h1>
          <p className="text-caption text-muted-foreground">
            Add a new attachment category
          </p>
        </div>
      </div>
      
      <div className="max-w-2xl">
        <div className="bg-card rounded-md shadow-sm p-4">
          <ApiForm
            fields={attachmentCategoryFormFields}
            title="Attachment Category Information"
            onSubmit={handleSubmit}
            submitText="Create Attachment Category"
          />
        </div>
      </div>
    </div>
  );
};

export default CreateAttachmentCategory;