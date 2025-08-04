# Backend Response Format Handling

## Backend Response Structure

Your backend returns responses in this specific format:

### Error Response (401 Example)

```json
{
  "data": [],
  "errors": {
    "error": "Authentication credentials were not provided."
  },
  "meta_data": {
    "success": false,
    "total": 0,
    "status_code": 401
  }
}
```

### Success Response

```json
{
    "data": [...],  // Array of actual data
    "errors": null,
    "meta_data": {
        "success": true,
        "total": 100,
        "status_code": 200
    }
}
```

## How the New API Client Handles This

### 1. Error Message Extraction

The client automatically extracts error messages from `errors.error`:

```typescript
// In client.ts createApiError method
if (data.errors?.error) {
  errorMessage = data.errors.error;
}
```

So when you catch an error:

```typescript
try {
  await apiCall("/assets/assets");
} catch (error) {
  console.log(error.message); // "Authentication credentials were not provided."
}
```

### 2. Response Data Structure

The API client returns the full response body to maintain backward compatibility:

```typescript
const response = await apiCall("/assets/assets");
// response.data contains the full backend response:
// {
//   "data": [...],
//   "errors": null,
//   "meta_data": { ... }
// }
```

### 3. Component Compatibility

Components like ApiTable already handle this structure:

```typescript
// In ApiTable.tsx
const primaryData = responses[0].data.data || responses[0].data;
```

This extracts the actual data array from the wrapped response.

## Benefits of This Approach

1. **100% Backward Compatibility**: All existing code continues to work
2. **Proper Error Messages**: Users see meaningful errors, not generic HTTP errors
3. **Meta Data Access**: Components can access `meta_data` for pagination, etc.
4. **Flexibility**: Components can choose how to handle the response structure

## Testing the Integration

Run these commands to test:

```typescript
// Test error handling
try {
  await apiCall("/protected-endpoint");
} catch (error) {
  // error.message = "Authentication credentials were not provided."
  // error.status = 401
  // error.data = full response object
}

// Test success handling
const response = await apiCall("/assets/assets");
const items = response.data.data; // Extract the array
const totalCount = response.data.meta_data.total; // Access metadata
```

## No Changes Required

Your existing components don't need any changes. They already handle this response format correctly.
