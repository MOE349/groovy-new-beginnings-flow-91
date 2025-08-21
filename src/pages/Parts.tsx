import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ApiTable, { TableColumn } from "@/components/ApiTable";

const Parts = () => {
  const columns: TableColumn[] = [
    { key: "part_number", header: "Part Number", type: "text" },
    { key: "name", header: "Name", type: "text" },
    { key: "description", header: "Description", type: "text" },
    { key: "last_price", header: "Last Price", type: "text" },
    { key: "make", header: "Make", type: "text" },
    { key: "category", header: "Category", type: "text" },
    { key: "component", header: "Component", type: "text" },
  ];

  return (
    <div className="space-y-2 min-w-0 h-full flex flex-col min-h-0">
      <div className="flex gap-4">
        <Button asChild size="sm">
          <Link to="/parts/create">
            <Plus className="mr-2 h-4 w-4" />
            New Part
          </Link>
        </Button>
      </div>

      <ApiTable
        endpoint="/parts/parts"
        columns={columns}
        queryKey={["parts", "all"]}
        emptyMessage="No parts found"
        editRoutePattern="/parts/edit/{id}"
        className="w-full flex-1 min-h-0 flex flex-col"
        height="100%"
        hasCreateButton={false}
      />
    </div>
  );
};

export default Parts;
