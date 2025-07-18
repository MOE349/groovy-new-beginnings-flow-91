
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFinancialDataOptimized } from '@/hooks/useFinancialDataOptimized';

interface FinancialDataDisplayProps {
  assetId: string;
}

const FinancialDataDisplay: React.FC<FinancialDataDisplayProps> = ({
  assetId
}) => {
  const { data, isLoading, error } = useFinancialDataOptimized(assetId);

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numValue);
  };

  const getTableValue = (key: string): string => {
    if (!data) return '0';
    return data[key]?.toString() || '0';
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Financial Data</CardTitle>
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
          <CardTitle>Financial Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load financial data'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Financial Data</CardTitle>
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
