import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiCall } from "@/utils/apis";
import ApiForm from "@/components/ApiForm";
import { StandardFormLayout } from "@/components/layout/StandardFormLayout";
import { attachmentCategoryFormFields } from "@/data/categoryFormFields";

const CreateAttachmentCategory = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiCall("/assets/attachment_category", {
        method: "POST",
        body: data,
      });
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
      <ApiForm
        fields={attachmentCategoryFormFields}
        onSubmit={handleSubmit}
        customLayout={({
          handleSubmit: handleFormSubmit,
          renderField,
          loading,
        }) => (
          <StandardFormLayout
            title="Attachment Category Information"
            backRoute="/settings"
            onSave={handleFormSubmit}
            loading={loading}
          >
            {attachmentCategoryFormFields.map(renderField)}
          </StandardFormLayout>
        )}
      />
    </div>
  );
};

export default CreateAttachmentCategory;
