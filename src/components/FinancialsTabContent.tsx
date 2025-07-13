import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FinancialReportForm from './FinancialReportForm';

interface FinancialsTabContentProps {
  assetId: string;
}

const FinancialsTabContent: React.FC<FinancialsTabContentProps> = ({ assetId }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentView, setCurrentView] = useState(0);

  const handleFormSuccess = () => {
    // Trigger a refresh of the financial data display
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewChange = (newView: number) => {
    setCurrentView(newView);
  };

  return (
    <div className="bg-card rounded-sm shadow-xs p-2 h-full min-h-[500px] overflow-hidden">
      
      {/* View 1: Three Container Layout */}
      {currentView === 0 && (
        <div className="flex gap-14 h-full relative animate-fade-in">
          
          {/* Navigation to View 2 */}
          <button
            onClick={() => handleViewChange(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
          
          {/* Ownership Cost Container */}
          <div className="w-1/3 ml-8">
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
            <div className="p-6 h-[474px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
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
          <div className="w-1/3 mr-8">
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
      )}

      {/* View 2: Single Big Container Layout */}
      {currentView === 1 && (
        <div className="h-full relative animate-fade-in">
          
          {/* Navigation back to View 1 */}
          <button
            onClick={() => handleViewChange(0)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
          </button>

          {/* Single Big Container */}
          <div className="h-full">
            <div className="p-8 h-[474px] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
              
              <div className="absolute top-1 left-8 right-8 flex items-center justify-center gap-4 py-1 bg-accent/20 border border-accent/30 rounded-md z-10">
                <h4 className="text-sm font-medium text-primary dark:text-secondary">All Financial Data</h4>
              </div>
              
              <div className="flex-grow space-y-4 overflow-auto mt-8">
                {/* Empty container - no fields yet */}
              </div>
            </div>
          </div>
          
        </div>
      )}
      
    </div>
  );
};

export default FinancialsTabContent;