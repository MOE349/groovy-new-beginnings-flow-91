
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '@/utils/apis';

export const useFinancialDataOptimized = (assetId: string) => {
  return useQuery({
    queryKey: ['financial-data', assetId],
    queryFn: async () => {
      try {
        const response = await apiGet(`/financial-reports/${assetId}`);
        return response.data?.data || response.data;
      } catch (error) {
        console.error('Failed to fetch financial data:', error);
        return null;
      }
    },
    enabled: !!assetId,
    staleTime: 5 * 60 * 1000, // 5 minutes - financial data doesn't change frequently
    retry: false
  });
};

export const usePrefetchFinancialData = () => {
  const queryClient = useQueryClient();
  
  return (assetId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['financial-data', assetId],
      queryFn: async () => {
        try {
          const response = await apiGet(`/financial-reports/${assetId}`);
          return response.data?.data || response.data;
        } catch (error) {
          return null;
        }
      },
      staleTime: 5 * 60 * 1000
    });
  };
};
