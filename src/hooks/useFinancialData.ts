import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '@/utils/apis';

interface FinancialData {
  totalCost: number;
  totalDepreciation: number;
  currentValue: number;
  totalMaintenance: number;
  totalDowntime: number;
  utilizationRate: number;
  costPerHour: number;
  roi: number;
}

export const useFinancialData = (assetId: string) => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = useCallback(async () => {
    if (!assetId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/financial-reports/${assetId}`);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  const refreshData = useCallback(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  return {
    data,
    loading,
    error,
    refreshData
  };
};