import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ApiTable from "@/components/ApiTable";

const Workorders = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate("/workorders/create")} variant="create-action" className="flex items-center gap-2" size="sm">
          <Plus className="h-4 w-4" />
          New Work Order
        </Button>
      </div>
      
      <ApiTable
        endpoint="/work-orders/work_order"
        editRoutePattern="/workorders/edit/{id}"
        columns={[
          { key: 'code', header: 'Code' },
          { key: 'asset', header: 'Asset', type: 'object' },
          { key: 'status', header: 'Status', type: 'object' },
          { key: 'maint_type', header: 'Maint Type' },
          { key: 'priority', header: 'Priority' },
          { key: 'suggested_start_date', header: 'Suggested Start Date' },
          { key: 'completion_end_date', header: 'Completion Date' },
          { key: 'is_closed', header: 'Closed', render: (value) => value ? 'Yes' : 'No' },
        ]}
      />
    </div>
  );
};

export default Workorders;