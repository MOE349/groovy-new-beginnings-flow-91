import { CreateEntityTemplate } from "@/templates/CreateEntityTemplate";
import { partCreateConfig } from "@/configs/entities/partConfig";

const CreatePart = () => {
  return <CreateEntityTemplate config={partCreateConfig} />;
};

export default CreatePart;
