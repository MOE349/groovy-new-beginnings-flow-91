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
            <Label htmlFor="expectedHours">Expected Hours</Label>
            <Input
              id="expectedHours"
              value={getTableValue('expected_hours')}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyPayment">Monthly Payment</Label>
            <Input
              id="monthlyPayment"
              value={formatCurrency(getTableValue('monthly_payment'))}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestAmount">Interest Amount</Label>
            <Input
              id="interestAmount"
              value={formatCurrency(getTableValue('interst_amount'))}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="operationalCostPerYear">Operational Cost Per Year</Label>
            <Input
              id="operationalCostPerYear"
              value={formatCurrency(getTableValue('operational_cost_per_year'))}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearlyHours">Yearly Hours</Label>
            <Input
              id="yearlyHours"
              value={getTableValue('yearly_hours')}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capitalCostPerHr">Capital Cost/Hr</Label>
            <Input
              id="capitalCostPerHr"
              value={formatCurrency(getTableValue('capital_cost_per_hr'))}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenanceCostPerHr">Maintenance Cost/Hr</Label>
            <Input
              id="maintenanceCostPerHr"
              value={formatCurrency(getTableValue('maintnance_cost_per_hr'))}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="operationalCostPerHr">Operational Cost/Hr</Label>
            <Input
              id="operationalCostPerHr"
              value={formatCurrency(getTableValue('operational_cost_per_hr'))}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalCostPerHr">Total Cost/Hr</Label>
            <Input
              id="totalCostPerHr"
              value={formatCurrency(getTableValue('total_cost_per_hr'))}
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