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
import {
  PendingFileService,
  type FileUploadResult,
} from "@/services/api/pendingFileService";
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

  // File upload support for add forms
  addLinkToModel?: string; // Model name for file uploads (e.g., "work_orders.workordermisccost")

  // Edit functionality
  canEdit?: boolean;
  editFields?: FormField[];
  editEndpoint?: (id: string) => string;
  editInitialData?: (row: any) => Record<string, any>;
  editFieldsTransform?: (fields: FormField[], row: any) => FormField[]; // Transform fields for each row
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
  enableColumnReorder?: boolean;
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
  addLinkToModel,
  canEdit = false,
  editFields = [],
  editEndpoint,
  editInitialData,
  editFieldsTransform,
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
  enableColumnReorder = true,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const queryClient = useQueryClient();

  const handleAddSubmit = async (data: Record<string, any>) => {
    if (!addEndpoint) return;

    try {
      // First, create the entity
      const response = await apiCall(addEndpoint, {
        method: "POST",
        body: { ...addInitialData, ...data },
      });

      // Get the created entity ID from response
      const entityId =
        (response as any).data?.data?.id ||
        (response as any).data?.id ||
        (response as any).id;

      // Process and upload any pending files if linkToModel is provided
      let uploadResults: FileUploadResult[] = [];
      if (addLinkToModel && entityId) {
        try {
          const { uploadResults: results } =
            await PendingFileService.processFormFiles(
              data,
              entityId,
              addLinkToModel
            );
          uploadResults = results;

          // Show file upload results
          const successCount = uploadResults.filter((r) => r.success).length;
          const failCount = uploadResults.filter((r) => !r.success).length;

          if (successCount > 0) {
            toast({
              title: "Files Uploaded",
              description: `${successCount} file${
                successCount !== 1 ? "s" : ""
              } uploaded successfully${
                failCount > 0 ? ` (${failCount} failed)` : ""
              }.`,
            });
          }

          if (failCount > 0) {
            toast({
              title: "File Upload Issues",
              description: `${failCount} file${
                failCount !== 1 ? "s" : ""
              } failed to upload. Check console for details.`,
              variant: "destructive",
            });
          }
        } catch (fileError) {
          console.error("Error uploading files:", fileError);
          toast({
            title: "File Upload Error",
            description:
              "Files could not be uploaded, but the record was created successfully.",
            variant: "destructive",
          });
        }
      }

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
      {/* Table */}
      <ApiTable
        title={title}
        hasCreateButton={canAdd && hasCreateButton}
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
        enableColumnReorder={enableColumnReorder}
        className={cn("w-full", tableClassName)}
      />

      {/* Add Dialog */}
      {canAdd && addFields.length > 0 && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {addButtonText.replace("Add ", "Add New ") ||
                  `Add New ${title || "Item"}`}
              </DialogTitle>
            </DialogHeader>
            <ApiForm
              fields={addFields}
              onSubmit={handleAddSubmit}
              submitText={addButtonText || `Add ${title || "Item"}`}
              cancelText="Cancel"
              onCancel={() => setIsAddDialogOpen(false)}
              initialData={addInitialData}
            />
          </DialogContent>
        </Dialog>
      )}

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
                    ? (editFieldsTransform
                        ? editFieldsTransform(editFields, selectedItem)
                        : editFields
                      ).map((field) => ({ ...field, disabled: true }))
                    : editFieldsTransform
                    ? editFieldsTransform(editFields, selectedItem)
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
