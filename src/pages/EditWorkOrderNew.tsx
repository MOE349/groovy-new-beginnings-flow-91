import { EditEntityTemplate } from "@/templates/EditEntityTemplate";
import { workOrderConfig } from "@/configs/entities/workOrderConfig";

const EditWorkOrderNew = () => {
  return <EditEntityTemplate config={workOrderConfig} />;
};

export default EditWorkOrderNew;
