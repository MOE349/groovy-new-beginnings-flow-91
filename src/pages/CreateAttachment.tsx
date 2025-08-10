import { CreateEntityTemplate } from "@/templates/CreateEntityTemplate";
import { attachmentCreateConfig } from "@/configs/entities/attachmentConfig";

const CreateAttachment = () => {
  return <CreateEntityTemplate config={attachmentCreateConfig} />;
};

export default CreateAttachment;
