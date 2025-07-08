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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Attachment Category</h1>
        <p className="text-muted-foreground">
          Add a new attachment category
        </p>
      </div>
      
      <ApiForm
        fields={attachmentCategoryFormFields}
        title="Attachment Category Information"
        onSubmit={handleSubmit}
        submitText="Create Attachment Category"
        className="max-w-2xl"
      />
    </div>
  );
};

export default CreateAttachmentCategory;