import React, { useState } from 'react';
import FinancialReportForm from './FinancialReportForm';

interface FinancialsTabContentProps {
  assetId: string;
}

const FinancialsTabContent: React.FC<FinancialsTabContentProps> = ({ assetId }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    // Trigger a refresh of the financial data display
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="bg-card rounded-sm shadow-xs p-2 h-full min-h-[500px] overflow-hidden">
      {/* Three Container Layout */}
      <div className="flex gap-4 h-full">
        
        {/* Ownership Cost Container */}
        <div className="w-1/3">
          <div className="p-6 h-[474px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
            <div className="flex items-center justify-center gap-4 mb-6 py-1 -mx-2 -mt-3 bg-accent/20 border border-accent/30 rounded-md">
              <h4 className="text-sm font-medium text-primary dark:text-secondary">Ownership Cost</h4>
            </div>
            
            <div className="flex-grow space-y-4 overflow-auto">
              <FinancialReportForm 
                assetId={assetId} 
                onSuccess={handleFormSuccess}
                fieldsToShow={['purchase_cost', 'resale_cost', 'finance_years', 'interest_rate', 'expected_hours']}
                containerType="ownership"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Cost Container */}
        <div className="w-1/3">
          <div className="p-6 h-[474px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
            <div className="flex items-center justify-center gap-4 mb-6 py-1 -mx-2 -mt-3 bg-accent/20 border border-accent/30 rounded-md">
              <h4 className="text-sm font-medium text-primary dark:text-secondary">Maintenance Cost</h4>
            </div>
            
            <div className="flex-grow space-y-4 overflow-auto">
              <FinancialReportForm 
                assetId={assetId} 
                onSuccess={handleFormSuccess}
                fieldsToShow={['capital_work_cost', 'monthly_payment', 'interst_amount', 'capital_cost_per_hr', 'maintnance_cost_per_hr']}
                containerType="maintenance"
              />
            </div>
          </div>
        </div>

        {/* Operational Cost Container */}
        <div className="w-1/3">
          <div className="p-6 h-[474px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
            <div className="flex items-center justify-center gap-4 mb-6 py-1 -mx-2 -mt-3 bg-accent/20 border border-accent/30 rounded-md">
              <h4 className="text-sm font-medium text-primary dark:text-secondary">Operational Cost</h4>
            </div>
            
            <div className="flex-grow space-y-4 overflow-auto">
              <FinancialReportForm 
                assetId={assetId} 
                onSuccess={handleFormSuccess}
                fieldsToShow={['operational_cost_per_year', 'yearly_hours', 'operational_cost_per_hr', 'total_cost_per_hr']}
                containerType="operational"
              />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default FinancialsTabContent;