# ApiTable Component

A modular, performant table component with sorting, filtering, resizing, drag-and-drop column reordering, and virtual scrolling support.

## Features

- **Data Fetching**: Automatic API data fetching with React Query
- **Column Management**: Sortable, filterable, resizable columns with drag-and-drop reordering
- **Virtual Scrolling**: Handle large datasets efficiently
- **Object Column Support**: Automatic ID extraction for object-type columns
- **Responsive**: Mobile-friendly design
- **Customizable**: Flexible column rendering and row actions

## Basic Usage

```tsx
import { ApiTable, TableColumn } from "@/components/ApiTable";

const columns: TableColumn[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "status", header: "Status", type: "object" },
];

function MyTable() {
  return (
    <ApiTable
      endpoint="/api/users"
      columns={columns}
      title="Users"
      editRoutePattern="/users/edit/{id}"
    />
  );
}
```

## Object Columns with ID Storage

When working with object-type columns (foreign key relationships), ApiTable automatically extracts and stores the object's ID for later use:

```tsx
const columns: TableColumn[] = [
  { key: "name", header: "Name" },
  {
    key: "location",
    header: "Location",
    type: "object",
    objectIdKey: "location_id", // Optional: defaults to "location_id"
  },
  {
    key: "status",
    header: "Status",
    type: "object",
    // Will automatically store ID as "status_id"
  },
];
```

### How Object ID Storage Works

1. **API Response**: Your API returns objects like:

   ```json
   {
     "name": "Asset 1",
     "location": { "id": 123, "name": "Warehouse A" },
     "status": { "id": 456, "name": "Active" }
   }
   ```

2. **Display**: Table shows "Warehouse A" and "Active"

3. **ID Storage**: Row data is enhanced with:

   ```javascript
   {
     "name": "Asset 1",
     "location": { "id": 123, "name": "Warehouse A" },
     "status": { "id": 456, "name": "Active" },
     "location_id": 123,  // Automatically added
     "status_id": 456     // Automatically added
   }
   ```

4. **Usage**: Access the IDs in row click handlers or custom render functions:
   ```tsx
   const handleRowClick = (row) => {
     console.log("Location ID:", row.location_id);
     console.log("Status ID:", row.status_id);
   };
   ```

## Column Configuration

### TableColumn Interface

```tsx
interface TableColumn<T = any> {
  key: string; // Data key
  header: string; // Display header
  type?: string; // Column type: "text", "date", "datetime", "object"
  render?: (value: any, row: T) => React.ReactNode; // Custom renderer
  className?: string; // CSS classes
  width?: number; // Initial width
  sortable?: boolean; // Enable sorting
  filterable?: boolean; // Enable filtering
  objectIdKey?: string; // For object columns: where to store the ID
}
```

### Column Types

- **text**: Plain text display
- **date**: Formatted date display
- **datetime/timestamp**: Formatted date-time display
- **object**: Object display with ID extraction

## Advanced Features

### Custom Rendering

```tsx
{
  key: "status",
  header: "Status",
  type: "object",
  render: (value, row) => (
    <Badge variant={row.status_id === 1 ? "success" : "warning"}>
      {value?.name || "-"}
    </Badge>
  )
}
```

### Row Actions

```tsx
<ApiTable
  // ... other props
  onRowClick={(row) => {
    // Access object IDs directly
    navigate(`/edit/${row.id}?location=${row.location_id}`);
  }}
  onDelete={(row) => {
    deleteItem(row.id);
  }}
/>
```

## Performance

- Uses React Query for efficient data fetching and caching
- Virtual scrolling for large datasets (set `virtualScroll={true}`)
- Optimized rendering with React.memo and useMemo
- Column width and order persistence

## Migration from Legacy ApiTable

This component is backward compatible. Existing tables will continue to work without changes. To benefit from object ID storage, simply ensure your object columns have `type: "object"`.
