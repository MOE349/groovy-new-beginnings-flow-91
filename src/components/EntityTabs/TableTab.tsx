import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ApiTable from "@/components/ApiTable";
import ApiForm from "@/components/ApiForm";
import { FormField } from "@/components/ApiForm";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";
import { cn } from "@/lib/utils";

export interface TableTabProps {
  hasCreateButton?: boolean;
  title?: string;
  description?: string;
  endpoint: string;
  columns: any[];
  queryKey: string[];
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;

  // Add/Edit functionality
  canAdd?: boolean;
  addButtonText?: string;
  addFields?: FormField[];
  addEndpoint?: string;
  addInitialData?: Record<string, any>;
  onAddSuccess?: (data: any) => void;

  // Edit functionality
  canEdit?: boolean;
  editFields?: FormField[];
  editEndpoint?: (id: string) => string;
  editInitialData?: (row: any) => Record<string, any>;
  onEditSuccess?: (data: any) => void;
  onRowClick?: (row: any) => void;
  editReadOnly?: boolean; // Make edit forms read-only

  // Secondary button support
  secondaryButtonText?: string;
  onSecondaryClick?: () => void | Promise<void>;
  secondaryButtonHref?: string;
  secondaryButtonVariant?:
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link";

  // Custom actions
  actions?: Array<{
    label: string;
    variant?:
      | "default"
      | "outline"
      | "secondary"
      | "destructive"
      | "ghost"
      | "link";
    onClick: () => void | Promise<void>;
    disabled?: boolean;
    icon?: React.ReactNode;
  }>;

  // Additional table props
  editRoutePattern?: string;
  showFilters?: boolean;
  maxHeight?: string;
  height?: string;
  filters?: Record<string, any>;
}

const TableTab: React.FC<TableTabProps> = ({
  hasCreateButton = true,
  title,
  description,
  endpoint,
  columns,
  queryKey,
  emptyMessage,
  className,
  tableClassName,
  canAdd = false,
  addButtonText = "Add Item",
  addFields = [],
  addEndpoint,
  addInitialData = {},
  onAddSuccess,
  canEdit = false,
  editFields = [],
  editEndpoint,
  editInitialData,
  onEditSuccess,
  onRowClick,
  editReadOnly = false,
  secondaryButtonText,
  onSecondaryClick,
  secondaryButtonHref,
  secondaryButtonVariant = "outline",
  actions = [],
  editRoutePattern,
  showFilters = true,
  maxHeight,
  height,
  filters,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const queryClient = useQueryClient();

  const handleAddSubmit = async (data: Record<string, any>) => {
    if (!addEndpoint) return;

    try {
      const response = await apiCall(addEndpoint, {
        method: "POST",
        body: { ...addInitialData, ...data },
      });

      queryClient.invalidateQueries({ queryKey });

      toast({
        title: "Success",
        description: `${title || "Item"} created successfully!`,
      });

      setIsAddDialogOpen(false);
      onAddSuccess?.(response);
    } catch (error: any) {
      handleApiError(
        error,
        `Failed to create ${title?.toLowerCase() || "item"}`
      );
    }
  };

  const handleEditSubmit = async (data: Record<string, any>) => {
    if (!editEndpoint || !selectedItem || editReadOnly) return; // Prevent submission when read-only

    try {
      const response = await apiCall(editEndpoint(selectedItem.id), {
        method: "PATCH",
        body: data,
      });

      queryClient.invalidateQueries({ queryKey });

      toast({
        title: "Success",
        description: `${title || "Item"} updated successfully!`,
      });

      setIsEditDialogOpen(false);
      setSelectedItem(null);
      onEditSuccess?.(response);
    } catch (error: any) {
      handleApiError(
        error,
        `Failed to update ${title?.toLowerCase() || "item"}`
      );
    }
  };

  const handleRowClickInternal = (row: any) => {
    if ((canEdit || editReadOnly) && editFields.length > 0) {
      setSelectedItem(row);
      setIsEditDialogOpen(true);
    }
    onRowClick?.(row);
  };

  return (
    <div className={cn("tab-content-generic", className)}>
      {/* Header */}
      {(title || description || canAdd || actions.length > 0) && (
        <div className="flex justify-between items-center">
          <div>
            {title && (
              <h3 className="text-h3 font-medium text-foreground">{title}</h3>
            )}
            {description && (
              <p className="text-caption text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                disabled={action.disabled}
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}

            {canAdd && addFields.length > 0 && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{addButtonText}</DialogTitle>
                  </DialogHeader>
                  <ApiForm
                    fields={addFields}
                    onSubmit={handleAddSubmit}
                    submitText={addButtonText}
                    initialData={addInitialData}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <ApiTable
        hasCreateButton={hasCreateButton}
        createNewText={addButtonText}
        onCreateNew={() => setIsAddDialogOpen(true)}
        secondaryButtonText={secondaryButtonText}
        onSecondaryClick={onSecondaryClick}
        secondaryButtonHref={secondaryButtonHref}
        secondaryButtonVariant={secondaryButtonVariant}
        endpoint={endpoint}
        columns={columns}
        queryKey={queryKey}
        emptyMessage={emptyMessage}
        onRowClick={
          canEdit || editReadOnly ? handleRowClickInternal : onRowClick
        }
        editRoutePattern={editRoutePattern}
        showFilters={showFilters}
        maxHeight={maxHeight}
        height={height}
        filters={filters}
        className={cn("w-full", tableClassName)}
      />

      {/* Edit Dialog */}
      {(canEdit || editReadOnly) && editFields.length > 0 && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editReadOnly ? "View" : "Edit"} {title || "Item"}
              </DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <ApiForm
                fields={
                  editReadOnly
                    ? editFields.map((field) => ({ ...field, disabled: true }))
                    : editFields
                }
                onSubmit={handleEditSubmit}
                submitText={
                  editReadOnly ? undefined : `Update ${title || "Item"}`
                }
                cancelText={editReadOnly ? undefined : "Cancel"}
                onCancel={
                  editReadOnly ? undefined : () => setIsEditDialogOpen(false)
                }
                initialData={
                  editInitialData ? editInitialData(selectedItem) : selectedItem
                }
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TableTab;
