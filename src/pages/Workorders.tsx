import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ApiTable from "@/components/ApiTable";

const Workorders = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <Button onClick={() => navigate("/workorders/create")} className="flex items-center gap-2 mt-4">
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