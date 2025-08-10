import { EditEntityTemplate } from "@/templates/EditEntityTemplate";
import { workOrderEditConfig } from "@/configs/entities/workOrderConfig";

const EditWorkOrder = () => {
  return <EditEntityTemplate config={workOrderEditConfig} />;
};

export default EditWorkOrder;
