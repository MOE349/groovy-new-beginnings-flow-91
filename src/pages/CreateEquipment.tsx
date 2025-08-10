import { CreateEntityTemplate } from "@/templates/CreateEntityTemplate";
import { equipmentCreateConfig } from "@/configs/entities/equipmentConfig";

const CreateEquipment = () => {
  return <CreateEntityTemplate config={equipmentCreateConfig} />;
};

export default CreateEquipment;
