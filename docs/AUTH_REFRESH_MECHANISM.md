# Authentication Refresh Mechanism

This document explains the enhanced authentication refresh mechanism implemented in the TenMil Fleet Management System.

## Overview

The authentication system uses JWT tokens with automatic refresh capabilities to maintain secure, uninterrupted user sessions.

## Key Features

### 1. **Proactive Token Refresh**
- Tokens are refreshed automatically 5 minutes before expiration
- Prevents authentication interruptions during active use
- Scheduled refresh based on token expiry time

### 2. **Request Queue Management**
- Multiple concurrent 401 responses trigger only ONE refresh attempt
- Other requests wait in queue until refresh completes
- Prevents token refresh race conditions

### 3. **Retry Logic with Exponential Backoff**
- Failed refresh attempts retry up to 3 times
- Exponential backoff: 1s, 2s, 4s between retries
- Handles temporary network issues gracefully

### 4. **React Query Integration**
- Automatic query invalidation on logout
- Query refetch after successful login
- Auth-aware retry configuration

### 5. **Cross-Tab Synchronization**
- Token changes sync across browser tabs
- Logout in one tab logs out all tabs
- Token refresh in one tab updates all tabs

## Architecture

### Components

1. **AuthInterceptor** (`src/services/auth.interceptor.ts`)
   - Manages token refresh logic
   - Handles request queuing
   - Schedules proactive refreshes

2. **ApiClient** (`src/services/api.base.ts`)
   - Integrates with AuthInterceptor
   - Handles 401 responses
   - Retries requests with new tokens

3. **AuthService** (`src/services/auth.service.ts`)
   - Provides login/logout/refresh methods
   - Manages token storage
   - Handles user data

4. **React Query Configuration** (`src/lib/react-query.ts`)
   - Auth-aware query client
   - Automatic cache invalidation
   - Cross-tab synchronization

## Flow Diagram

```
┌─────────────────┐
│   User Action   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     401 Response      ┌──────────────────┐
│   ApiClient     │─────────────────────►│  AuthInterceptor │
└────────┬────────┘                      └────────┬─────────┘
         │                                        │
         │                                        ▼
         │                               ┌──────────────────┐
         │                               │  Refresh Token   │
         │                               └────────┬─────────┘
         │                                        │
         │          New Token                     │
         │◄───────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Retry Request  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Response     │
└─────────────────┘
```

## Usage

### Initialization

The auth interceptor is initialized automatically when the app starts:

```typescript
// In src/main.tsx
authInterceptor.initialize()
```

### Making Authenticated Requests

All services automatically include authentication:

```typescript
// Using service methods
const assets = await assetService.getAssets();

// Using React Query hooks
const { data } = useAssets();
```

### Handling Auth Errors

Auth errors are handled automatically:
- 401 responses trigger token refresh
- Failed refresh redirects to login
- Queries are paused during refresh

### Manual Token Management

```typescript
// Check if token needs refresh
authInterceptor.checkTokenExpiry();

// Clear all auth data
authInterceptor.clearAuth();
```

## Configuration

### Token Expiry Buffer
Default: 5 minutes before expiration

```typescript
const bufferTime = 5 * 60 * 1000; // 5 minutes
```

### Retry Configuration
- Max retries: 3
- Backoff: Exponential (1s, 2s, 4s)

### Public Endpoints
Endpoints that don't require authentication:
- `/auth/login`
- `/auth/register`
- `/auth/refresh`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/verify-email`

## Best Practices

1. **Never manually manage tokens** - Let the interceptor handle it
2. **Use service methods** - They include auth automatically
3. **Handle loading states** - Refresh may cause brief delays
4. **Monitor token expiry** - Check browser DevTools for scheduled refreshes

## Security Considerations

1. **Tokens stored in localStorage** - XSS vulnerable but convenient
2. **Refresh tokens rotated** - Old refresh tokens invalidated
3. **Automatic logout** - On refresh failure or token tampering
4. **HTTPS required** - Tokens transmitted securely

## Troubleshooting

### Token Not Refreshing
1. Check browser console for errors
2. Verify refresh token exists in localStorage
3. Check network tab for refresh requests

### Constant Logouts
1. Verify token expiry times
2. Check server clock synchronization
3. Review refresh endpoint responses

### Cross-Tab Issues
1. Ensure localStorage is not disabled
2. Check for storage event listeners
3. Verify same-origin policy

## Future Enhancements

1. **Sliding sessions** - Extend expiry on activity
2. **Refresh token rotation** - New refresh token on each use
3. **Biometric authentication** - For sensitive operations
4. **Session management UI** - View/manage active sessions