import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiTable, TableColumn } from "@/components/ApiTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ApiForm, { FormField } from "@/components/ApiForm";
import { useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";

export interface QuadTableConfig {
  endpoint: string;
  columns: TableColumn[];
  tableId: string;
  queryKey: string[];
  title?: string; // Optional title for each table section

  // Optional create functionality
  createButtonText?: string;
  dialogTitle?: string;
  formFields?: FormField[];
  createEndpoint?: string;
  onDelete?: (id: string) => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
  additionalData?: Record<string, unknown>;

  // Additional table props
  filters?: Record<string, unknown>;
  emptyMessage?: string;
  className?: string;
  height?: string;
  maxHeight?: string;
  hasCreateButton?: boolean;
  editRoutePattern?: string;
  showFilters?: boolean;
  persistColumnOrder?: boolean;
  enableColumnReorder?: boolean;
}

export interface QuadApiTableTabProps {
  assetId: string;
  // Page 1 tables
  topLeftTable: QuadTableConfig;
  topRightTable: QuadTableConfig;
  // Page 2 tables
  bottomLeftTable: QuadTableConfig;
  bottomRightTable: QuadTableConfig;
  className?: string;
}

export const QuadApiTableTab: React.FC<QuadApiTableTabProps> = ({
  assetId,
  topLeftTable,
  topRightTable,
  bottomLeftTable,
  bottomRightTable,
  className = "tab-content-generic",
}) => {
  const queryClient = useQueryClient();
  const [openDialogs, setOpenDialogs] = useState({
    topLeft: false,
    topRight: false,
    bottomLeft: false,
    bottomRight: false,
  });

  // Check if tables have create functionality
  const tableConfigs = {
    topLeftTable,
    topRightTable,
    bottomLeftTable,
    bottomRightTable,
  };
  const hasCreate = Object.fromEntries(
    Object.entries(tableConfigs).map(([key, config]) => [
      key,
      config.formFields && config.createEndpoint && config.createButtonText,
    ])
  );

  const createSubmitHandler = (
    config: QuadTableConfig,
    dialogKey: keyof typeof openDialogs
  ) => {
    return async (data: Record<string, unknown>) => {
      if (!config.createEndpoint) return;

      const submissionData = {
        ...data,
        asset: assetId,
        ...config.additionalData,
      };

      try {
        await apiCall(config.createEndpoint, {
          method: "POST",
          body: submissionData,
        });

        // Invalidate queries
        queryClient.invalidateQueries({
          queryKey: config.queryKey,
        });

        setOpenDialogs((prev) => ({ ...prev, [dialogKey]: false }));

        toast({
          title: "Success",
          description: config.successMessage || "Item created successfully!",
        });
      } catch (error) {
        handleApiError(error, config.errorMessage || "Save Failed");
      }
    };
  };

  const renderDialog = (
    dialogKey: keyof typeof openDialogs,
    config: QuadTableConfig
  ) => {
    if (!config.formFields || !config.dialogTitle) return null;

    return (
      <Dialog
        open={openDialogs[dialogKey]}
        onOpenChange={(open) =>
          setOpenDialogs((prev) => ({ ...prev, [dialogKey]: open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{config.dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ApiForm
              fields={config.formFields}
              onSubmit={createSubmitHandler(config, dialogKey)}
              customLayout={({ handleSubmit, renderField }) => (
                <div className="space-y-4">
                  {config.formFields?.map((field) => renderField(field))}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setOpenDialogs((prev) => ({
                          ...prev,
                          [dialogKey]: false,
                        }))
                      }
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Save</Button>
                  </div>
                </div>
              )}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderTable = (
    config: QuadTableConfig,
    dialogKey: keyof typeof openDialogs,
    configKey: keyof typeof tableConfigs
  ) => (
    <ApiTable
      title={config.title}
      {...(hasCreate[configKey] && {
        createNewText: config.createButtonText,
        onCreateNew: () =>
          setOpenDialogs((prev) => ({ ...prev, [dialogKey]: true })),
      })}
      {...(!hasCreate[configKey] && {
        hasCreateButton: config.hasCreateButton ?? false,
      })}
      endpoint={config.endpoint}
      columns={config.columns}
      tableId={config.tableId}
      filters={config.filters}
      queryKey={config.queryKey}
      emptyMessage={config.emptyMessage}
      className={config.className}
      height={config.height}
      maxHeight={config.maxHeight}
      editRoutePattern={config.editRoutePattern}
      showFilters={config.showFilters}
      persistColumnOrder={config.persistColumnOrder ?? false}
      enableColumnReorder={config.enableColumnReorder ?? false}
    />
  );

  return (
    <div
      className="h-full overflow-y-auto scroll-smooth"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {/* Page 1: Top Left + Top Right Tables */}
      <div
        className="h-full animate-fade-in"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className={`${className} h-full`}>
          <div className="tab-content-grid-2 gap-4 h-full">
            {renderTable(topLeftTable, "topLeft", "topLeftTable")}
            {renderTable(topRightTable, "topRight", "topRightTable")}
          </div>
        </div>
      </div>

      {/* Page 2: Bottom Left + Bottom Right Tables */}
      <div
        className="h-full animate-fade-in"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className={`${className} h-full`}>
          <div className="tab-content-grid-2 gap-4 h-full">
            {renderTable(bottomLeftTable, "bottomLeft", "bottomLeftTable")}
            {renderTable(bottomRightTable, "bottomRight", "bottomRightTable")}
          </div>
        </div>
      </div>

      {/* Render all dialogs */}
      {renderDialog("topLeft", topLeftTable)}
      {renderDialog("topRight", topRightTable)}
      {renderDialog("bottomLeft", bottomLeftTable)}
      {renderDialog("bottomRight", bottomRightTable)}
    </div>
  );
};

export default QuadApiTableTab;
