# Object ID Storage Example

This example demonstrates how ApiTable automatically stores object IDs for object-type columns.

## Example Configuration

```tsx
const columns: TableColumn[] = [
  { key: "code", header: "Code" },
  { key: "asset", header: "Asset", type: "object", objectIdKey: "asset_id" },
  { key: "status", header: "Status", type: "object" }, // Uses default "status_id"
  { key: "location", header: "Location", type: "object" },
];
```

## API Response Data

```json
[
  {
    "id": 1,
    "code": "WO-001",
    "asset": { "id": 123, "name": "Pump A" },
    "status": { "id": 2, "name": "In Progress" },
    "location": { "id": 45, "name": "Building 1", "code": "B1" }
  }
]
```

## Processed Row Data

ApiTable automatically enhances each row with extracted IDs:

```javascript
{
  "id": 1,
  "code": "WO-001",
  "asset": { "id": 123, "name": "Pump A" },
  "status": { "id": 2, "name": "In Progress" },
  "location": { "id": 45, "name": "Building 1", "code": "B1" },

  // Automatically added by ApiTable:
  "asset_id": 123,      // Uses custom objectIdKey
  "status_id": 2,       // Uses default "${key}_id" pattern
  "location_id": 45     // Uses default "${key}_id" pattern
}
```

## Display and Usage

### Table Display

- **Asset column** shows: "Pump A"
- **Status column** shows: "In Progress"
- **Location column** shows: "Building 1" (or "B1" if only code exists)

### Accessing IDs in Code

```tsx
// In a custom render function
{
  key: "actions",
  header: "Actions",
  render: (_, row) => (
    <Button onClick={() => {
      // Access the stored IDs directly
      editAsset(row.asset_id);
      updateStatus(row.status_id);
      changeLocation(row.location_id);
    }}>
      Edit
    </Button>
  ),
}

// In a row click handler
<ApiTable
  columns={columns}
  onRowClick={(row) => {
    // Navigate with related object IDs
    navigate(`/workorder/${row.id}`, {
      state: {
        assetId: row.asset_id,
        statusId: row.status_id,
        locationId: row.location_id
      }
    });
  }}
/>

// In filtering or searching
const filterByAsset = (assetId: number) => {
  const filteredRows = data.filter(row => row.asset_id === assetId);
  return filteredRows;
};
```

## Benefits

1. **No Extra API Calls**: IDs are extracted from existing data
2. **Type Safety**: IDs are available as row properties
3. **Consistent Access**: Always available as `${key}_id` or custom key
4. **Performance**: Extraction happens once during data processing
5. **Backward Compatible**: Existing code continues to work

## Real-World Use Cases

### 1. Drill-Down Navigation

```tsx
onRowClick={(row) => {
  navigate(`/asset/${row.asset_id}`);
}}
```

### 2. Bulk Operations

```tsx
const selectedRows = getSelectedRows();
const assetIds = selectedRows.map((row) => row.asset_id);
updateMultipleAssets(assetIds);
```

### 3. Conditional Rendering

```tsx
{
  key: "maintenance",
  header: "Maintenance",
  render: (_, row) => (
    <MaintenanceButton
      assetId={row.asset_id}
      isActive={row.status_id === ACTIVE_STATUS_ID}
    />
  ),
}
```

### 4. Form Pre-population

```tsx
const handleEdit = (row) => {
  setFormData({
    workOrderId: row.id,
    selectedAsset: row.asset_id,
    currentStatus: row.status_id,
    assignedLocation: row.location_id,
  });
};
```
