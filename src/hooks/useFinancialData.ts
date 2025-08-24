import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/utils/apis";

interface FinancialData {
  // Raw financial data fields
  assetId: string;
  assetValue: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  maintenanceCost: number;
  depreciation: number;
  utilisationRate: number;
  totalOperationalCost: number;

  // Calculated table with financial metrics
  table?: {
    [key: string]: string | number;
  };
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

      // Check if data is nested under response.data.data
      const actualData = response.data?.data || response.data;

      setData(actualData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch financial data"
      );
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
    refreshData,
  };
};
