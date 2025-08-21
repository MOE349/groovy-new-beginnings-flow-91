import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ApiTable, { TableColumn } from "@/components/ApiTable";

const Asset = () => {
  const columns: TableColumn[] = [
    { key: "name", header: "Name" },
    { key: "description", header: "Description" },
    { key: "code", header: "Code" },
    { key: "category", header: "Category", type: "object" },
    { key: "make", header: "Make" },
    { key: "model", header: "Model" },
    { key: "location", header: "Location", type: "object" },
    {
      key: "is_online",
      header: "Online Status",
      render: (value) => (value ? "Online" : "Offline"),
    },
    {
      key: "equipment",
      header: "Type",
      render: (value, row) => (row.equipment ? "Attachment" : "Equipment"),
    },
  ];

  return (
    <div className="space-y-2 min-w-0 h-full flex flex-col min-h-0">
      <div className="flex gap-4">
        <Button asChild size="sm">
          <Link to="/asset/equipment/create">
            <Plus className="mr-2 h-4 w-4" />
            New Equipment
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/asset/attachment/create">
            <Plus className="mr-2 h-4 w-4" />
            New Attachment
          </Link>
        </Button>
      </div>

      <ApiTable
        endpoint="/assets/assets"
        columns={columns}
        queryKey={["assets", "all"]}
        emptyMessage="No assets found"
        editRoutePattern="/asset/edit/{id}"
        className="w-full flex-1 min-h-0 flex flex-col"
        height="100%"
        hasCreateButton={false}
      />
    </div>
  );
};

export default Asset;
