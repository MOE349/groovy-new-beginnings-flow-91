import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/utils/errorHandling';

/**
 * Generic hook for API queries with React Query
 */
export function useApiQuery<T>(
  queryKey: any[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
    onError?: (error: any) => void;
  }
) {
  const { toast } = useToast();

  return useQuery({
    queryKey,
    queryFn,
    ...options,
    onError: (error) => {
      handleApiError(error);
      options?.onError?.(error);
    },
  });
}

/**
 * Generic hook for API mutations with React Query
 */
export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables) => void;
    invalidateQueries?: any[];
    successMessage?: string;
  }
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      if (options?.successMessage) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }
      
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      handleApiError(error);
      options?.onError?.(error, variables);
    },
  });
}

// ========== Asset Hooks ==========

export function useAssets(filters?: Parameters<typeof services.asset.getAssets>[0]) {
  return useApiQuery(
    ['assets', filters],
    () => services.asset.getAssets(filters)
  );
}

export function useAsset(id: string) {
  return useApiQuery(
    ['assets', id],
    () => services.asset.getAssetById(id),
    { enabled: !!id }
  );
}

export function useCreateAsset() {
  return useApiMutation(
    services.asset.createEquipment,
    {
      invalidateQueries: [['assets']],
      successMessage: 'Asset created successfully',
    }
  );
}

export function useUpdateAsset() {
  return useApiMutation(
    ({ id, data }: { id: string; data: Parameters<typeof services.asset.updateEquipment>[1] }) =>
      services.asset.updateEquipment(id, data),
    {
      invalidateQueries: [['assets']],
      successMessage: 'Asset updated successfully',
    }
  );
}

export function useDeleteAsset() {
  return useApiMutation(
    services.asset.deleteAsset,
    {
      invalidateQueries: [['assets']],
      successMessage: 'Asset deleted successfully',
    }
  );
}

// ========== Work Order Hooks ==========

export function useWorkOrders(filters?: Parameters<typeof services.workOrder.getWorkOrders>[0]) {
  return useApiQuery(
    ['workOrders', filters],
    () => services.workOrder.getWorkOrders(filters)
  );
}

export function useWorkOrder(id: string) {
  return useApiQuery(
    ['workOrders', id],
    () => services.workOrder.getWorkOrderById(id),
    { enabled: !!id }
  );
}

export function useCreateWorkOrder() {
  return useApiMutation(
    services.workOrder.createWorkOrder,
    {
      invalidateQueries: [['workOrders']],
      successMessage: 'Work order created successfully',
    }
  );
}

export function useUpdateWorkOrder() {
  return useApiMutation(
    ({ id, data }: { id: string; data: Parameters<typeof services.workOrder.updateWorkOrder>[1] }) =>
      services.workOrder.updateWorkOrder(id, data),
    {
      invalidateQueries: [['workOrders']],
      successMessage: 'Work order updated successfully',
    }
  );
}

// ========== User Hooks ==========

export function useUsers(filters?: Parameters<typeof services.user.getUsers>[0]) {
  return useApiQuery(
    ['users', filters],
    () => services.user.getUsers(filters)
  );
}

export function useCurrentUser() {
  return useApiQuery(
    ['currentUser'],
    () => services.user.getCurrentUser()
  );
}

export function useUserRoles() {
  return useApiQuery(
    ['userRoles'],
    () => services.user.getRoles()
  );
}

// ========== Company Hooks ==========

export function useSites(activeOnly?: boolean) {
  return useApiQuery(
    ['sites', { activeOnly }],
    () => services.company.getSites(activeOnly)
  );
}

export function useLocations(siteId?: string) {
  return useApiQuery(
    ['locations', { siteId }],
    () => services.company.getLocations(siteId)
  );
}

export function useCompanySettings() {
  return useApiQuery(
    ['companySettings'],
    () => services.company.getCompanySettings()
  );
}

// ========== Analytics Hooks ==========

export function useFleetUtilizationReport(filters: Parameters<typeof services.analytics.getFleetUtilizationReport>[0]) {
  return useApiQuery(
    ['analytics', 'fleetUtilization', filters],
    () => services.analytics.getFleetUtilizationReport(filters),
    { enabled: !!filters.start_date && !!filters.end_date }
  );
}

export function useMaintenanceReport(filters: Parameters<typeof services.analytics.getMaintenanceReport>[0]) {
  return useApiQuery(
    ['analytics', 'maintenance', filters],
    () => services.analytics.getMaintenanceReport(filters),
    { enabled: !!filters.start_date && !!filters.end_date }
  );
}

export function useKPIMetrics(filters?: Parameters<typeof services.analytics.getKPIMetrics>[0]) {
  return useApiQuery(
    ['analytics', 'kpis', filters],
    () => services.analytics.getKPIMetrics(filters),
    { refetchInterval: 5 * 60 * 1000 } // Refresh every 5 minutes
  );
}

// ========== File Hooks ==========

export function useUploadFile() {
  return useApiMutation(
    ({ file, options }: { file: File; options?: Parameters<typeof services.file.uploadFile>[1] }) =>
      services.file.uploadFile(file, options),
    {
      successMessage: 'File uploaded successfully',
    }
  );
}

export function useFilesByEntity(entityType: string, entityId: string, category?: string) {
  return useApiQuery(
    ['files', entityType, entityId, category],
    () => services.file.getFilesByEntity(entityType, entityId, category),
    { enabled: !!entityType && !!entityId }
  );
}

export function useDeleteFile() {
  return useApiMutation(
    services.file.deleteFile,
    {
      invalidateQueries: [['files']],
      successMessage: 'File deleted successfully',
    }
  );
}