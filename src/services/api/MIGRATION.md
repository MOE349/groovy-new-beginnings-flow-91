# API Client Migration Guide

## Overview

The API client has been refactored from a single 274-line file to a modular, feature-rich system that maintains 100% backward compatibility while adding significant improvements.

## Key Improvements

### 1. **Request Cancellation**
```typescript
// Cancel specific endpoint requests
apiClient.cancel('/assets/assets');

// Cancel all pending requests
apiClient.cancelAll();
```

### 2. **Automatic Retry with Exponential Backoff**
```typescript
// Configure retry per request
await apiCall('/assets/assets', {
  retry: {
    retries: 3,
    retryDelay: exponentialBackoff,
    retryCondition: (error) => error.status >= 500
  }
});
```

### 3. **Request/Response Interceptors**
```typescript
// Add custom interceptor
apiClient.interceptor.useRequest((config) => {
  config.headers['X-Custom-Header'] = 'value';
  return config;
});

// Add response interceptor
apiClient.interceptor.useResponse({
  onFulfilled: (response) => {
    // Log successful responses
    return response;
  },
  onRejected: (error) => {
    // Handle errors globally
    throw error;
  }
});
```

### 4. **Better TypeScript Support**
- Fully typed request/response interfaces
- Generic type support for responses
- Proper error typing

### 5. **Performance Improvements**
- Removed console.log statements
- Efficient request deduplication
- Proper cleanup of resources
- Smaller bundle size through modular imports

## Migration Steps

### Existing Code Works As-Is

All existing code using `apiCall` from `@/utils/apis` continues to work without changes:

```typescript
// This still works exactly as before
import { apiCall } from '@/utils/apis';

const response = await apiCall('/assets/assets');
const data = response.data;
```

### Optional: Use New Features

To access new features, import from the new location:

```typescript
import { apiClient } from '@/services/api';

// Use with retry
const response = await apiClient.get('/assets/assets', {
  retry: {
    retries: 3,
    retryDelay: exponentialBackoff
  }
});

// Cancel requests
apiClient.cancel('/assets/assets');
```

### Optional: Direct Client Usage

For more control, use the client directly:

```typescript
import { apiClient } from '@/services/api';

// GET request with params
const response = await apiClient.get('/assets/assets', {
  params: {
    page: 1,
    limit: 20
  }
});

// POST with timeout
const response = await apiClient.post('/assets/equipments', 
  { name: 'New Equipment' },
  { timeout: 5000 }
);
```

## Performance Comparison

### Before:
- File size: 274 lines
- Features: Basic fetch wrapper with token refresh
- No request cancellation
- No retry logic
- Console.log in production
- Monolithic structure

### After:
- Total size: ~400 lines (but modular)
- Features: All previous + cancellation, retry, interceptors
- Better error handling
- TypeScript support
- Tree-shakeable imports
- No console.log in production

## Advanced Usage Examples

### 1. File Upload with Progress
```typescript
const formData = new FormData();
formData.append('file', file);

await apiClient.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  timeout: 60000 // 1 minute for large files
});
```

### 2. Parallel Requests with Cancellation
```typescript
const controller = new AbortController();

try {
  const [assets, locations] = await Promise.all([
    apiClient.get('/assets/assets', { signal: controller.signal }),
    apiClient.get('/company/location', { signal: controller.signal })
  ]);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Requests cancelled');
  }
}

// Cancel if needed
controller.abort();
```

### 3. Custom Error Handling
```typescript
apiClient.interceptor.useResponse({
  onRejected: (error) => {
    if (error.status === 403) {
      // Handle forbidden access
      router.push('/unauthorized');
    }
    throw error;
  }
});
```

## Benefits Summary

1. **No Breaking Changes**: All existing code continues to work
2. **Better Performance**: Modular imports, no debug logs
3. **Enhanced Features**: Cancellation, retry, interceptors
4. **Improved DX**: Better TypeScript support, cleaner API
5. **Future-Proof**: Easy to extend with new features

## Next Steps

1. Existing code requires no changes
2. New code can leverage advanced features
3. Gradually migrate to use new features where beneficial
4. Remove direct fetch() calls in favor of apiClient