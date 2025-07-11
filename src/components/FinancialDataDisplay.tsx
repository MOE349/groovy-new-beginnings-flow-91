import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFinancialData } from '@/hooks/useFinancialData';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FinancialDataDisplayProps {
  assetId: string;
  refreshTrigger?: number;
}

const FinancialDataDisplay: React.FC<FinancialDataDisplayProps> = ({
  assetId,
  refreshTrigger
}) => {
  const { data, loading, error, refreshData } = useFinancialData(assetId);

  // Refresh data when refreshTrigger changes
  React.useEffect(() => {
    if (refreshTrigger !== undefined) {
      refreshData();
    }
  }, [refreshTrigger, refreshData]);

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numValue);
  };

  const formatPercentage = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return `${(numValue * 100).toFixed(2)}%`;
  };

  const getTableValue = (key: string): string => {
    if (!data?.table) return '0';
    return data.table[key]?.toString() || '0';
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Financial Data
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Financial Data
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Financial Data
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalCostHr">Total Cost/Hr</Label>
            <Input
              id="totalCostHr"
              value={formatCurrency(getTableValue('Total Cost/Hr'))}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyPayment">Monthly Payment</Label>
            <Input
              id="monthlyPayment"
              value={formatCurrency(getTableValue('Monthly payment'))}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate</Label>
            <Input
              id="interestRate"
              value={`${getTableValue('Interest rate')}%`}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenanceCost">Maintenance Cost</Label>
            <Input
              id="maintenanceCost"
              value={formatCurrency(getTableValue('Maintenance Cost'))}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="depreciation">Depreciation</Label>
            <Input
              id="depreciation"
              value={formatCurrency(getTableValue('Depreciation'))}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="utilisation">Utilisation Rate</Label>
            <Input
              id="utilisation"
              value={`${getTableValue('Utilisation')}%`}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalOperationalCost">Total Operational Cost</Label>
            <Input
              id="totalOperationalCost"
              value={formatCurrency(getTableValue('Total Operational Cost'))}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetValue">Asset Value</Label>
            <Input
              id="assetValue"
              value={formatCurrency(getTableValue('Asset Value'))}
              disabled
              className="bg-muted"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialDataDisplay;