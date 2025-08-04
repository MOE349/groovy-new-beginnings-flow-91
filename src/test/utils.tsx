import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/components/NotificationSystem';
import ErrorBoundary from '@/components/ErrorBoundary';

// Create a custom render function that includes all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  route?: string;
  queryClient?: QueryClient;
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    route = '/',
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <NotificationProvider>
                <ThemeProvider attribute="class" defaultTheme="light">
                  {children}
                </ThemeProvider>
              </NotificationProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Mock data generators
export const mockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  tenant_id: 'tenant-1',
  role: {
    id: '1',
    name: 'admin',
    display_name: 'Administrator',
    permissions: ['system.admin'],
  },
  permissions: ['system.admin'],
  is_active: true,
  is_verified: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const mockAsset = (overrides = {}) => ({
  id: '1',
  name: 'Test Asset',
  code: 'ASSET-001',
  description: 'Test asset description',
  category: {
    id: '1',
    name: 'Equipment',
    slug: 'equipment',
  },
  make: 'Test Make',
  model: 'Test Model',
  serial_number: 'SN-12345',
  location: {
    id: '1',
    name: 'Main Warehouse',
    code: 'MW-01',
  },
  is_online: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const mockWorkOrder = (overrides = {}) => ({
  id: '1',
  code: 'WO-001',
  asset: {
    id: '1',
    name: 'Test Asset',
    code: 'ASSET-001',
  },
  status: {
    id: '1',
    name: 'Open',
    color: 'blue',
  },
  priority: 'medium',
  description: 'Test work order',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: {
    id: '1',
    name: 'Test User',
  },
  ...overrides,
});

// API response mocks
export const mockApiResponse = <T>(data: T, status = 200) => ({
  data,
  status,
  statusText: 'OK',
});

export const mockApiError = (message = 'API Error', status = 400) => ({
  status,
  statusText: 'Bad Request',
  data: {
    error: message,
    errors: {
      error: message,
    },
  },
});

// Wait utilities
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';