import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ApiTable, { TableColumn } from "@/components/ApiTable";

const WorkOrders = () => {
  const columns: TableColumn[] = [
    { key: "code", header: "Code" },
    { key: "description", header: "Description" },
    { key: "asset", header: "Asset", type: "object" },
    { key: "status", header: "Status", type: "object" },
    { key: "maint_type", header: "Maint Type" },
    { key: "priority", header: "Priority" },
    { key: "suggested_start_date", header: "Suggested Start Date", render: (value) => value ? new Date(value).toLocaleDateString() : "-" },
    { key: "completion_end_date", header: "Completion Date", render: (value) => value ? new Date(value).toLocaleDateString() : "-" },
    { key: "is_closed", header: "Closed", render: (value) => value ? "Yes" : "No" },
  ];

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex gap-4">
        <Button asChild size="sm">
          <Link to="/workorders/create">
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Link>
        </Button>
      </div>

      <ApiTable
        endpoint="/work-orders/work_order"
        columns={columns}
        queryKey={["work_orders"]}
        emptyMessage="No work orders found"
        editRoutePattern="/workorders/edit/{id}"
        className="w-full"
      />
    </div>
  );
};

export default WorkOrders;