import React, { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApiTable } from "@/components/ApiTable";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { TableColumn } from "@/components/ApiTable/types";

interface Part {
  id: string;
  name: string;
  part_number?: string;
  number?: string;
  description?: string;
}

interface PartSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedPartIds: string[]) => void;
  workOrderId: string;
}

export const PartSelectionDialog: React.FC<PartSelectionDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  workOrderId,
}) => {
  const [selectedParts, setSelectedParts] = useState<Part[]>([]);

  // Reset selected parts when dialog opens
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setSelectedParts([]);
      }
      onOpenChange(isOpen);
    },
    [onOpenChange]
  );

  // Handle part selection from catalog
  const handlePartSelect = useCallback((part: Part) => {
    setSelectedParts((prev) => {
      // Don't add if already selected
      if (prev.some((p) => p.id === part.id)) {
        return prev;
      }
      return [...prev, part];
    });
  }, []);

  // Handle part removal from selection
  const handlePartRemove = useCallback((partId: string) => {
    setSelectedParts((prev) => prev.filter((p) => p.id !== partId));
  }, []);

  // Check if a part is selected
  const isPartSelected = useCallback(
    (partId: string) => {
      return selectedParts.some((p) => p.id === partId);
    },
    [selectedParts]
  );

  // Handle confirm
  const handleConfirm = useCallback(() => {
    const selectedPartIds = selectedParts.map((part) => part.id);
    onConfirm(selectedPartIds);
    setSelectedParts([]);
    onOpenChange(false);
  }, [selectedParts, onConfirm, onOpenChange]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setSelectedParts([]);
    onOpenChange(false);
  }, [onOpenChange]);

  // Parts catalog columns
  const catalogColumns: TableColumn[] = useMemo(
    () => [
      {
        key: "part_number",
        header: "Part Number",
        type: "string",
        render: (value: unknown, row: Record<string, unknown>) => {
          const partNumber =
            (row.part_number as string) || (row.number as string) || "—";
          const isSelected = isPartSelected(row.id as string);
          return (
            <span
              className={
                isSelected
                  ? "line-through text-muted-foreground"
                  : "font-medium"
              }
            >
              {partNumber}
            </span>
          );
        },
      },
      {
        key: "name",
        header: "Part Name",
        type: "string",
        render: (value: unknown, row: Record<string, unknown>) => {
          const isSelected = isPartSelected(row.id as string);
          return (
            <span
              className={isSelected ? "line-through text-muted-foreground" : ""}
            >
              {(value as string) || "—"}
            </span>
          );
        },
      },
      {
        key: "description",
        header: "Description",
        type: "string",
        render: (value: unknown, row: Record<string, unknown>) => {
          const isSelected = isPartSelected(row.id as string);
          const description = (value as string) || "—";
          return (
            <span
              className={
                isSelected ? "line-through text-muted-foreground" : "text-sm"
              }
            >
              {description.length > 50
                ? `${description.substring(0, 50)}...`
                : description}
            </span>
          );
        },
      },
    ],
    [isPartSelected]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Parts for Work Order</DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
          {/* Left Side - Parts Catalog */}
          <div className="flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-3">Parts Catalog</h3>
            <div className="flex-1 min-h-0 border rounded-lg">
              <ApiTable
                endpoint="/parts/parts"
                columns={catalogColumns}
                queryKey={["parts_catalog_selection"]}
                emptyMessage="No parts found"
                onRowClick={(row) => {
                  if (!isPartSelected(row.id as string)) {
                    handlePartSelect(row as Part);
                  }
                }}
                showFilters={true}
                enableColumnReorder={false}
                persistColumnOrder={false}
                hasCreateButton={false}
                height="100%"
                className="h-full"
              />
            </div>
          </div>

          {/* Right Side - Selected Parts */}
          <div className="flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-3">
              Selected Parts ({selectedParts.length})
            </h3>
            <div className="flex-1 min-h-0 border rounded-lg p-4 bg-muted/30">
              {selectedParts.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg mb-2">No parts selected</p>
                    <p className="text-sm">
                      Click on rows in the catalog to add parts
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto">
                  {selectedParts.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-3 bg-background border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handlePartRemove(part.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {part.part_number || part.number || "—"}
                          </Badge>
                        </div>
                        <p className="font-medium truncate">{part.name}</p>
                        {part.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {part.description}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedParts.length} part{selectedParts.length !== 1 ? "s" : ""}{" "}
            selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedParts.length === 0}
            >
              Add {selectedParts.length} Part
              {selectedParts.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
