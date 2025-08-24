import React, { useRef } from "react";
import FinancialReportForm from "./FinancialReportForm";
import { useFinancialDataOptimized } from "@/hooks/useFinancialDataOptimized";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialsTabContentProps {
  assetId: string;
}

const FinancialsTabContent: React.FC<FinancialsTabContentProps> = ({
  assetId,
}) => {
  // Use the optimized hook to get shared financial data
  const { data: financialData, isLoading } = useFinancialDataOptimized(assetId);

  // Refs to store submit functions for each form
  const ownershipSubmitRef = useRef<(() => void) | null>(null);
  const maintenanceSubmitRef = useRef<(() => void) | null>(null);
  const operationalSubmitRef = useRef<(() => void) | null>(null);

  // Show skeleton loading for immediate feedback
  const renderSkeletonForm = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-4 w-[120px]" />
          <div className="flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
      <div className="pt-4">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );

  return (
    <div
      className="tab-content-generic h-full overflow-y-auto scroll-smooth"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {/* Row 1: Three Financial Containers - Horizontal Cards Stacked Vertically */}
      <div
        className="flex flex-col gap-1.5 h-full animate-fade-in mb-8 px-8 pt-4"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Ownership Cost Container */}
        <div className="w-full">
          <div className="p-4 h-[12.5rem] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-row">
            {/* Left sidebar with vertical title and update button */}
            <div className="flex flex-col items-center justify-between w-24 border-r border-primary/10 py-2">
              <div className="flex-1 flex items-center justify-center">
                <h4 className="text-sm font-medium text-primary dark:text-secondary transform -rotate-90 whitespace-nowrap">
                  Ownership Cost
                </h4>
              </div>
              <button
                className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                onClick={() => ownershipSubmitRef.current?.()}
              >
                Update
              </button>
            </div>

            {/* Content area */}
            <div className="flex-grow overflow-auto pl-4 pr-4">
              {isLoading ? (
                renderSkeletonForm()
              ) : (
                <FinancialReportForm
                  assetId={assetId}
                  fieldsToShow={[
                    "purchase_cost",
                    "resale_cost",
                    "finance_years",
                    "interest_rate",
                    "expected_hours",
                    "capital_work_cost",
                    "monthly_payment",
                    "interst_amount",
                    "yearly_hours",
                  ]}
                  containerType="ownership"
                  columns={5}
                  onSubmitRef={(submitFn) =>
                    (ownershipSubmitRef.current = submitFn)
                  }
                />
              )}
            </div>

            {/* Right display area for Capital Cost Per Hour */}
            <div className="w-48 card- flex flex-col items-center justify-center border-l border-primary/10 px-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  Capital Cost
                </div>
                <div className="text-xl font-semibold text-primary">
                  {isLoading
                    ? "..."
                    : financialData?.capital_cost_per_hr || "-"}
                </div>
                <div className="text-sm text-muted-foreground">per hour</div>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Cost Container */}
        <div className="w-full">
          <div className="p-4 h-[12.5rem] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-row">
            {/* Left sidebar with vertical title and update button */}
            <div className="flex flex-col items-center justify-between w-24 border-r border-primary/10 py-2">
              <div className="flex-1 flex items-center justify-center">
                <h4 className="text-sm font-medium text-primary dark:text-secondary transform -rotate-90 whitespace-nowrap">
                  Maintenance Cost
                </h4>
              </div>
              <button
                className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                onClick={() => maintenanceSubmitRef.current?.()}
              >
                Update
              </button>
            </div>

            {/* Content area */}
            <div className="flex-grow overflow-auto pl-4 pr-4">
              {isLoading ? (
                renderSkeletonForm()
              ) : (
                <FinancialReportForm
                  assetId={assetId}
                  fieldsToShow={[]}
                  containerType="maintenance"
                  columns={5}
                  onSubmitRef={(submitFn) =>
                    (maintenanceSubmitRef.current = submitFn)
                  }
                />
              )}
            </div>

            {/* Right display area for Maintenance Cost Per Hour */}
            <div className="w-48 flex flex-col items-center justify-center border-l border-primary/10 px-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  Maintenance Cost
                </div>
                <div className="text-xl font-semibold text-primary">
                  {isLoading
                    ? "..."
                    : financialData?.maintnance_cost_per_hr || "-"}
                </div>
                <div className="text-sm text-muted-foreground">per hour</div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Cost Container */}
        <div className="w-full">
          <div className="p-4 h-[12.5rem] relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-row">
            {/* Left sidebar with vertical title and update button */}
            <div className="flex flex-col items-center justify-between w-24 border-r border-primary/10 py-2">
              <div className="flex-1 flex items-center justify-center">
                <h4 className="text-sm font-medium text-primary dark:text-secondary transform -rotate-90 whitespace-nowrap">
                  Operational Cost
                </h4>
              </div>
              <button
                className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                onClick={() => operationalSubmitRef.current?.()}
              >
                Update
              </button>
            </div>

            {/* Content area */}
            <div className="flex-grow overflow-auto pl-4 pr-4">
              {isLoading ? (
                renderSkeletonForm()
              ) : (
                <FinancialReportForm
                  assetId={assetId}
                  fieldsToShow={["operational_cost_per_year"]}
                  containerType="operational"
                  columns={5}
                  onSubmitRef={(submitFn) =>
                    (operationalSubmitRef.current = submitFn)
                  }
                />
              )}
            </div>

            {/* Right display area for Operational Cost Per Hour */}
            <div className="w-48 flex flex-col items-center justify-center border-l border-primary/10 px-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  Operational Cost
                </div>
                <div className="text-xl font-semibold text-primary">
                  {isLoading
                    ? "..."
                    : financialData?.operational_cost_per_hr || "-"}
                </div>
                <div className="text-sm text-muted-foreground">per hour</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: All Financial Data - Full Width */}
      <div
        className="h-full animate-fade-in"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="p-4 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
          <div className="flex items-center justify-center gap-4 mb-2 py-1 bg-accent/20 border border-accent/30 rounded-md">
            <h4 className="text-sm font-medium text-primary dark:text-secondary">
              All Financial Data
            </h4>
          </div>

          <div className="flex-grow space-y-4 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-[140px]" />
                    <div className="flex-1">
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <FinancialReportForm
                assetId={assetId}
                fieldsToShow={[
                  "capital_cost_per_hr",
                  "maintnance_cost_per_hr",
                  "operational_cost_per_hr",
                  "total_cost_per_hr",
                ]}
                containerType="all"
                columns={4}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialsTabContent;
