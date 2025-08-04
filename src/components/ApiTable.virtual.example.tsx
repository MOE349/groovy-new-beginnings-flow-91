/**
 * ApiTable Virtual Scrolling Example
 * Demonstrates how to use virtual scrolling for large datasets
 */

import React from "react";
import { ApiTable, TableColumn } from "@/components/ApiTable";

// Example 1: Basic Virtual Scrolling
export const BasicVirtualScrollingExample = () => {
  const columns: TableColumn[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "status", header: "Status" },
    { key: "created_at", header: "Created" },
  ];

  return (
    <div>
      <h2>Large Dataset with Virtual Scrolling</h2>
      <p>This table efficiently renders 10,000+ rows</p>

      <ApiTable
        endpoint="/api/users?limit=10000"
        columns={columns}
        virtualScroll={true}
        rowHeight={40}
        height="600px"
        showFilters={true}
        editRoutePattern="/users/{id}/edit"
      />
    </div>
  );
};

// Example 2: Variable Row Heights
export const VariableHeightExample = () => {
  const columns: TableColumn[] = [
    { key: "id", header: "ID", width: 80 },
    { key: "title", header: "Title" },
    {
      key: "description",
      header: "Description",
      render: (value) => <div className="py-2 whitespace-normal">{value}</div>,
    },
    { key: "price", header: "Price", width: 120 },
  ];

  return (
    <div>
      <h2>Variable Row Heights</h2>
      <p>Rows have different heights based on content length</p>

      <ApiTable
        endpoint="/api/products"
        columns={columns}
        virtualScroll={true}
        rowHeight={(row) => {
          // Calculate height based on description length
          const descLength = row.description?.length || 0;
          if (descLength > 200) return 120;
          if (descLength > 100) return 80;
          return 50;
        }}
        height="500px"
      />
    </div>
  );
};

// Example 3: Performance Comparison
export const PerformanceComparisonExample = () => {
  const [useVirtual, setUseVirtual] = React.useState(true);

  const columns: TableColumn[] = [
    { key: "id", header: "ID" },
    { key: "metric", header: "Metric" },
    { key: "value", header: "Value" },
    { key: "timestamp", header: "Timestamp" },
  ];

  return (
    <div>
      <h2>Performance Comparison</h2>

      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useVirtual}
            onChange={(e) => setUseVirtual(e.target.checked)}
          />
          Enable Virtual Scrolling
        </label>
        <p className="text-sm text-muted-foreground mt-1">
          Toggle to see performance difference with 5000 rows
        </p>
      </div>

      <ApiTable
        endpoint="/api/metrics?limit=5000"
        columns={columns}
        virtualScroll={useVirtual}
        rowHeight={40}
        height="400px"
        refreshInterval={useVirtual ? 5000 : undefined} // Only auto-refresh with virtual scrolling
      />
    </div>
  );
};

// Example 4: With All Features
export const FullFeaturedVirtualExample = () => {
  const columns: TableColumn[] = [
    { key: "id", header: "ID", width: 80 },
    { key: "name", header: "Name", filterable: true },
    { key: "department", header: "Department", filterable: true },
    { key: "role", header: "Role", filterable: true },
    {
      key: "salary",
      header: "Salary",
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <div>
      <h2>Full Featured Virtual Table</h2>
      <p>
        Virtual scrolling with filtering, resizing, reordering, and custom
        rendering
      </p>

      <ApiTable
        endpoint="/api/employees?limit=10000"
        columns={columns}
        virtualScroll={true}
        rowHeight={45}
        height="70vh"
        showFilters={true}
        persistColumnOrder={true}
        tableId="employees-virtual"
        onDelete={(row) => console.log("Delete:", row)}
        createNewHref="/employees/new"
        createNewText="Add Employee"
      />
    </div>
  );
};

// Usage in a page component
const VirtualScrollingDemo = () => {
  return (
    <div className="space-y-8 p-4">
      <h1 className="text-2xl font-bold">
        ApiTable Virtual Scrolling Examples
      </h1>

      <BasicVirtualScrollingExample />
      <VariableHeightExample />
      <PerformanceComparisonExample />
      <FullFeaturedVirtualExample />
    </div>
  );
};

export default VirtualScrollingDemo;
