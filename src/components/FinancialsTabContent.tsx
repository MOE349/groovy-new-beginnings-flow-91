import React, { useState } from 'react';
import FinancialReportForm from './FinancialReportForm';
import FinancialDataDisplay from './FinancialDataDisplay';

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
    <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
      <div className="flex gap-6 h-full">
        {/* Left side - Financial Report Form */}
        <div className="w-1/2">
          <FinancialReportForm 
            assetId={assetId} 
            onSuccess={handleFormSuccess}
          />
        </div>

        {/* Right side - Financial Data Display */}
        <div className="w-1/2">
          <FinancialDataDisplay 
            assetId={assetId}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialsTabContent;