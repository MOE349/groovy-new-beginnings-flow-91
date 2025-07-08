import ApiTable, { TableColumn } from "@/components/ApiTable";
import { Badge } from "@/components/ui/badge";

// Example 1: Simple usage
export const SimpleApiTable = () => {
  const columns: TableColumn[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
  ];

  return (
    <ApiTable
      endpoint="users"
      columns={columns}
      title="Users List"
      queryKey={["users"]}
    />
  );
};

// Example 2: With custom rendering
export const AssetsApiTable = () => {
  const columns: TableColumn[] = [
    { key: "name", header: "Asset Name" },
    { key: "category", header: "Category" },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <Badge
          variant={value === "Active" ? "default" : "secondary"}
        >
          {value}
        </Badge>
      ),
    },
    { key: "location", header: "Location" },
    { key: "assignedTo", header: "Assigned To" },
    { key: "purchaseDate", header: "Purchase Date" },
    { 
      key: "value", 
      header: "Value", 
      className: "text-right",
      render: (value) => <span className="font-medium">{value}</span>
    },
  ];

  return (
    <ApiTable
      endpoint="assets"
      columns={columns}
      title="Asset Inventory"
      queryKey={["assets"]}
      emptyMessage="No assets found"
    />
  );
};

// Example 3: Without card wrapper
export const PlainApiTable = () => {
  const columns: TableColumn[] = [
    { key: "title", header: "Title" },
    { key: "author", header: "Author" },
    { key: "publishedAt", header: "Published" },
  ];

  return (
    <ApiTable
      endpoint="articles"
      columns={columns}
      queryKey={["articles"]}
    />
  );
};