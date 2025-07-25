
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '@/utils/apis';

export const useFinancialDataOptimized = (assetId: string) => {
  return useQuery({
    queryKey: ['financial-data', assetId],
    queryFn: async () => {
      const response = await apiGet(`/financial-reports/${assetId}`);
      return response.data?.data || response.data;
    },
    enabled: !!assetId,
    staleTime: 2 * 60 * 1000, // 2 minutes - reduced for more responsive updates
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    retry: 1, // Only retry once for faster failure feedback
    refetchOnWindowFocus: false // Prevent unnecessary refetches
  });
};

export const usePrefetchFinancialData = () => {
  const queryClient = useQueryClient();
  
  return (assetId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['financial-data', assetId],
      queryFn: async () => {
        const response = await apiGet(`/financial-reports/${assetId}`);
        return response.data?.data || response.data;
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000
    });
  };
};
