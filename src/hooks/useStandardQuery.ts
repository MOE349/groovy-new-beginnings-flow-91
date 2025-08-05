import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";

export interface UseStandardQueryOptions<T = any>
  extends Omit<UseQueryOptions<T>, "queryFn"> {
  endpoint: string;
  transformData?: (data: any) => T;
}

/**
 * Standardized query hook that wraps React Query with consistent patterns
 *
 * @example
 * const { data, isLoading, error } = useStandardQuery({
 *   queryKey: ['assets', assetId],
 *   endpoint: `/assets/${assetId}`,
 *   transformData: (data) => data.data || data
 * });
 */
export function useStandardQuery<T = any>({
  endpoint,
  transformData,
  ...options
}: UseStandardQueryOptions<T>) {
  return useQuery<T>({
    ...options,
    queryFn: async () => {
      const response = await apiCall(endpoint);
      const data = response.data?.data || response.data;
      return transformData ? transformData(data) : data;
    },
  });
}
