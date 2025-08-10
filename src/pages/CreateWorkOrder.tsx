import { CreateEntityTemplate } from "@/templates/CreateEntityTemplate";
import { workOrderCreateConfig } from "@/configs/entities/workOrderConfig";

const CreateWorkOrder = () => {
  return <CreateEntityTemplate config={workOrderCreateConfig} />;
};

export default CreateWorkOrder;
