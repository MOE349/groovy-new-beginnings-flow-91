import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ApiTable, { TableColumn } from "@/components/ApiTable";

const Asset = () => {
  const navigate = useNavigate();

  const handleRowClick = (row: any) => {
    const assetType = row.equipment ? "attachments" : "equipments";
    navigate(`/assets/${assetType}/${row.id}`);
  };

  const columns: TableColumn[] = [
    { key: "name", header: "Name" },
    { key: "description", header: "Description" },
    { key: "code", header: "Code" },
    { key: "category", header: "Category", type: "object" },
    { key: "make", header: "Make" },
    { key: "model", header: "Model" },
    { key: "location", header: "Location", type: "object" },
    { key: "is_online", header: "Online Status", render: (value) => value ? "Online" : "Offline" },
    { 
      key: "equipment", 
      header: "Type", 
      render: (value, row) => row.equipment ? "Attachment" : "Equipment" 
    },
  ];

  return (
    <div className="space-y-6">
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
        onRowClick={handleRowClick}
        className="w-full"
      />
    </div>
  );
};

export default Asset;