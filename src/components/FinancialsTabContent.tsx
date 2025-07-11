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
    <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
      <FinancialReportForm 
        assetId={assetId} 
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default FinancialsTabContent;