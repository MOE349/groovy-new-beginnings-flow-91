import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ApiTable, { TableColumn } from "@/components/ApiTable";
import { AppPage } from "@/components/layout/AppPage";

const WorkOrders = () => {
  const columns: TableColumn[] = [
    { key: "code", header: "Code" },
    { key: "description", header: "Description" },
    { key: "asset", header: "Asset", type: "object" },
    { key: "status", header: "Status", type: "object" },
    { key: "maint_type", header: "Maint Type" },
    { key: "priority", header: "Priority" },
    {
      key: "suggested_start_date",
      header: "Suggested Start Date",
      type: "date",
    },
    {
      key: "completion_end_date",
      header: "Completion Date",
      type: "date",
    },
    {
      key: "is_closed",
      header: "Closed",
      render: (value) => (value ? "Yes" : "No"),
    },
  ];

  return (
    <AppPage
      top={
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to="/workorders/create">
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Link>
          </Button>
        </div>
      }
      bodyClassName="min-w-0"
    >
      <div className="min-w-0 h-full">
        <div className="overflow-x-auto">
          <div className="min-w-[1024px]">
            <ApiTable
              endpoint="/work-orders/work_order"
              columns={columns}
              queryKey={["work_orders"]}
              emptyMessage="No work orders found"
              editRoutePattern="/workorders/edit/{id}"
              className="w-full flex-1 min-h-0 flex flex-col"
              height="100%"
            />
          </div>
        </div>
      </div>
    </AppPage>
  );
};

export default WorkOrders;
