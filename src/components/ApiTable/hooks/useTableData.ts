/**
 * useTableData Hook
 * Handles data fetching and management for ApiTable
 */

import { useQuery } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";
import type {
  UseTableDataOptions,
  UseTableDataReturn,
  TableColumn,
} from "../types";

export function useTableData<T = any>({
  endpoint,
  secondaryEndpoint,
  filters: endpointFilters,
  queryKey,
  refreshInterval,
  enabled = true,
  columns,
}: UseTableDataOptions<T>): UseTableDataReturn<T> {
  const { data, isLoading, error, isError, refetch, isRefetching } = useQuery({
    queryKey:
      queryKey ||
      (secondaryEndpoint
        ? [endpoint, secondaryEndpoint, endpointFilters]
        : [endpoint, endpointFilters]),
    queryFn: async () => {
      // Construct endpoint with filters
      const constructEndpoint = (baseEndpoint: string) => {
        if (!endpointFilters || Object.keys(endpointFilters).length === 0) {
          return baseEndpoint;
        }

        const params = new URLSearchParams();
        Object.entries(endpointFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((item) => params.append(key, String(item)));
            } else {
              params.append(key, String(value));
            }
          }
        });

        const separator = baseEndpoint.includes("?") ? "&" : "?";
        return `${baseEndpoint}${separator}${params.toString()}`;
      };

      const primaryEndpoint = constructEndpoint(endpoint);
      const promises = [apiCall(primaryEndpoint)];

      // Add secondary endpoint if provided
      if (secondaryEndpoint) {
        const secondaryEndpointWithFilters =
          constructEndpoint(secondaryEndpoint);
        promises.push(apiCall(secondaryEndpointWithFilters));
      }

      const responses = await Promise.all(promises);

      // Extract data from responses (handles backend's { data: [...] } format)
      const primaryData = responses[0].data.data || responses[0].data;
      const secondaryData =
        secondaryEndpoint && responses[1]
          ? responses[1].data.data || responses[1].data
          : [];

      // Add source metadata to each row
      const primaryWithSource = Array.isArray(primaryData)
        ? primaryData.map((item: any) => ({ ...item, _dataSource: "primary" }))
        : [];

      const secondaryWithSource = Array.isArray(secondaryData)
        ? secondaryData.map((item: any) => ({
            ...item,
            _dataSource: "secondary",
          }))
        : [];

      // Combine data arrays
      const combinedData = [...primaryWithSource, ...secondaryWithSource];

      // Process object columns to extract and store IDs
      if (columns && combinedData.length > 0) {
        const objectColumns = columns.filter((col) => col.type === "object");

        if (objectColumns.length > 0) {
          return combinedData.map((row) => {
            const processedRow = { ...row };

            objectColumns.forEach((column) => {
              const value = row[column.key];
              if (value && typeof value === "object" && value.id) {
                const idKey = column.objectIdKey || `${column.key}_id`;
                processedRow[idKey] = value.id;
              }
            });

            return processedRow;
          });
        }
      }

      return combinedData;
    },
    enabled,
    refetchInterval: refreshInterval,
    staleTime: refreshInterval ? 0 : 5 * 60 * 1000, // 5 minutes if no refresh interval
  });

  return {
    data: data || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    isRefetching,
  };
}
