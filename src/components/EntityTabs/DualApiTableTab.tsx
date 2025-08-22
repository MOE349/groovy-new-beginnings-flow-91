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

export interface TableConfig {
  endpoint: string;
  columns: TableColumn[];
  tableId: string;
  queryKey: string[];
  // Optional create functionality
  createButtonText?: string;
  dialogTitle?: string;
  formFields?: FormField[];
  createEndpoint?: string;
  onDelete?: (row: Record<string, unknown>) => Promise<void>;
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
}

export interface DualApiTableTabProps {
  assetId: string;
  leftTable: TableConfig;
  rightTable: TableConfig;
  className?: string;
}

export const DualApiTableTab: React.FC<DualApiTableTabProps> = ({
  assetId,
  leftTable,
  rightTable,
  className = "tab-content-metering",
}) => {
  const queryClient = useQueryClient();
  const [isLeftDialogOpen, setIsLeftDialogOpen] = useState(false);
  const [isRightDialogOpen, setIsRightDialogOpen] = useState(false);

  // Check if tables have create functionality
  const hasLeftCreate =
    leftTable.formFields &&
    leftTable.createEndpoint &&
    leftTable.createButtonText;
  const hasRightCreate =
    rightTable.formFields &&
    rightTable.createEndpoint &&
    rightTable.createButtonText;

  const createSubmitHandler = (
    config: TableConfig,
    setDialogOpen: (open: boolean) => void
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

        setDialogOpen(false);

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
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    config: TableConfig
  ) => {
    if (!config.formFields || !config.dialogTitle) return null;

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{config.dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ApiForm
              fields={config.formFields}
              onSubmit={createSubmitHandler(config, setIsOpen)}
              customLayout={({ handleSubmit, renderField }) => (
                <div className="space-y-4">
                  {config.formFields?.map((field) => renderField(field))}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
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

  return (
    <div className={className}>
      <div className="tab-content-grid-2 gap-4">
        <ApiTable
          {...(hasLeftCreate && {
            createNewText: leftTable.createButtonText,
            onCreateNew: () => setIsLeftDialogOpen(true),
          })}
          {...(!hasLeftCreate && {
            hasCreateButton: leftTable.hasCreateButton ?? false,
          })}
          {...leftTable}
        />
        <ApiTable
          {...(hasRightCreate && {
            createNewText: rightTable.createButtonText,
            onCreateNew: () => setIsRightDialogOpen(true),
          })}
          {...(!hasRightCreate && {
            hasCreateButton: rightTable.hasCreateButton ?? false,
          })}
          {...rightTable}
        />
      </div>

      {hasLeftCreate &&
        renderDialog(isLeftDialogOpen, setIsLeftDialogOpen, leftTable)}
      {hasRightCreate &&
        renderDialog(isRightDialogOpen, setIsRightDialogOpen, rightTable)}
    </div>
  );
};

export default DualApiTableTab;
