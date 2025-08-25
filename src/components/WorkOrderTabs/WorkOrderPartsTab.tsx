import React, { useState, useRef, useEffect } from "react";
import { TableTab } from "@/components/EntityTabs";
import { FormField } from "@/components/ApiForm";
import {
  InlineEditableApiTable,
  EditableTableColumn,
} from "@/components/InlineEditableApiTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import ApiForm from "@/components/ApiForm";
import { PartSelectionDialog } from "@/components/PartSelectionDialog";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/utils/apis";

export interface WorkOrderPartsTabProps {
  workOrderId: string;
  isReadOnly?: boolean;
}

const WorkOrderPartsTab: React.FC<WorkOrderPartsTabProps> = ({
  workOrderId,
  isReadOnly = false,
}) => {
  const [isPartSelectionDialogOpen, setIsPartSelectionDialogOpen] =
    useState(false);
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
  const [currentEditContext, setCurrentEditContext] = useState<{
    rowId: string | number;
    columnKey: string;
    newValue: unknown;
    updatedRow: Record<string, unknown>;
    partId?: string | number;
    onSave?: () => void;
  } | null>(null);
  const [availableLocations, setAvailableLocations] = useState<
    { id: string; name: string; qty?: number }[]
  >([]);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Handle clicks outside the popover to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationPopoverOpen &&
        popoverRef.current &&
        inputRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !inputRef.current.contains(event.target as Node)
      ) {
        // Close popover and clean up state
        setLocationPopoverOpen(false);
        setCurrentEditContext(null);
        setAvailableLocations([]);
        setPopoverPosition(null);
      }
    };

    if (locationPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [locationPopoverOpen]);

  // Calculate popover position based on input element
  const calculatePopoverPosition = (inputElement: HTMLInputElement) => {
    const rect = inputElement.getBoundingClientRect();
    const popoverWidth = 384; // w-96 = 384px

    // Estimate actual popover height based on content (much smaller due to compact styling)
    const itemCount = availableLocations.length;
    const itemHeight = 32; // py-1.5 = ~6px top + 6px bottom + text height ≈ 32px per item
    const padding = 8; // p-1 = 4px top + 4px bottom
    const actualPopoverHeight = Math.min(itemCount * itemHeight + padding, 160); // Cap at 160px for max-h-40

    let top = rect.top - actualPopoverHeight; // Align bottom of popup with top of input
    let left = rect.left;

    // Adjust if popover would go off-screen vertically
    if (top < 10) {
      top = rect.bottom + 2; // Show below with minimal gap if no space above
    }

    // Keep original horizontal positioning (left-aligned with input)
    if (left + popoverWidth > window.innerWidth - 20) {
      left = window.innerWidth - popoverWidth - 20;
    }

    if (left < 20) {
      left = 20;
    }

    return { top, left };
  };

  // Handle multiple parts selection from new dialog
  const handlePartsSelection = async (selectedPartIds: string[]) => {
    try {
      // Add each selected part to the work order
      const promises = selectedPartIds.map((partId) =>
        apiCall("/parts/work-order-parts", {
          method: "POST",
          body: {
            work_order: workOrderId,
            part: partId,
          },
        })
      );

      await Promise.all(promises);

      toast({
        title: "Success",
        description: `${selectedPartIds.length} part${
          selectedPartIds.length !== 1 ? "s" : ""
        } added to work order successfully!`,
      });

      // Invalidate and refresh the work order parts table
      queryClient.invalidateQueries({
        queryKey: ["work_order_parts", workOrderId],
      });

      setIsPartSelectionDialogOpen(false);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          (error instanceof Error ? error.message : String(error)) ||
          "Failed to add parts to work order",
        variant: "destructive",
      });
    }
  };

  // Fetch available locations for a part
  const fetchLocations = async (partId: string | number) => {
    try {
      console.log("Fetching locations for part:", partId);
      const response = await apiCall(
        `/parts/get-part-location?part=${partId}&work_order=${workOrderId}`
      );
      console.log("Locations API response:", response);
      const locations = response?.data?.data || response?.data || [];
      console.log("Processed locations:", locations);
      const processedLocations = Array.isArray(locations) ? locations : [];
      setAvailableLocations(processedLocations);
      return processedLocations; // Return the locations for immediate use
    } catch (error: unknown) {
      console.error("Failed to fetch locations:", error);

      // Handle specific API error format - check multiple possible error structures
      console.log("API error:", error);
      console.log("API error structure:", JSON.stringify(error, null, 2));

      let errorMessage = "Failed to fetch available locations for this part";

      if (error && typeof error === "object") {
        // Check for direct errors.error structure
        if ("errors" in error) {
          const apiError = error as { errors?: { error?: string } };
          if (apiError.errors?.error) {
            errorMessage = apiError.errors.error;
          }
        }
        // Check for error.response.data structure (common with axios)
        else if (
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response
        ) {
          const responseError = error.response as {
            data?: { errors?: { error?: string } };
          };
          if (responseError.data?.errors?.error) {
            errorMessage = responseError.data.errors.error;
          }
        }
        // Check for error.data structure
        else if (
          "data" in error &&
          error.data &&
          typeof error.data === "object" &&
          "errors" in error.data
        ) {
          const dataError = error.data as { errors?: { error?: string } };
          if (dataError.errors?.error) {
            errorMessage = dataError.errors.error;
          }
        }
        // Check if error has a message property
        else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Reset state when there's an error
      setAvailableLocations([]);
      setLocationPopoverOpen(false);
      setCurrentEditContext(null);
      setPopoverPosition(null);

      return [];
    }
  };

  // Handle location selection from popover
  const handleLocationSelect = async (
    locationId: string,
    locationName: string
  ) => {
    if (!currentEditContext) return;

    try {
      // Create the payload with both qty_used and location
      const updatePayload = {
        [currentEditContext.columnKey]: currentEditContext.newValue,
        location: locationId,
      };

      // Update the work order part with both qty and location
      await apiCall(`/parts/work-order-parts/${currentEditContext.rowId}`, {
        method: "PATCH",
        body: updatePayload,
      });

      toast({
        title: "Success",
        description: `Part quantity and location (${locationName}) updated successfully!`,
      });

      // Refresh the table
      queryClient.invalidateQueries({
        queryKey: ["work_order_parts", workOrderId],
      });

      // Exit edit mode by calling the stored onSave callback
      if (currentEditContext?.onSave) {
        currentEditContext.onSave();
      }

      // Clean up state
      setLocationPopoverOpen(false);
      setCurrentEditContext(null);
      setAvailableLocations([]);
      setPopoverPosition(null);
      console.log("Location selected, cell deselected, context cleared");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          (error instanceof Error ? error.message : String(error)) ||
          "Failed to update part quantity and location",
        variant: "destructive",
      });
    }
  };

  // Define columns for the inline editable table
  const columns: EditableTableColumn[] = [
    {
      key: "part_number",
      header: "Part Number",
      type: "object",
      editable: false, // Not editable
      render: (value: unknown, row: Record<string, unknown>) => {
        const partObj = row.part;
        if (!partObj) return "—";
        const part =
          typeof partObj === "object" && partObj !== null
            ? (partObj as Record<string, unknown>)
            : {};
        const partNumber =
          (part.part_number as string) || (part.number as string) || "—";
        return <span className="font-medium">{partNumber}</span>;
      },
    },
    {
      key: "part_name",
      header: "Part Name",
      type: "string",
      editable: false, // Not editable
      render: (value: unknown, row: Record<string, unknown>) => {
        const partName = (row.part_name as string) || "—";
        return <span>{partName}</span>;
      },
    },
    {
      key: "qty_used",
      header: "QTY",
      type: "string",
      editable: !isReadOnly, // Only editable if not read-only
      editType: "number",
      validate: (value: string | number) => {
        const numValue =
          typeof value === "number" ? value : parseFloat(String(value));
        if (isNaN(numValue)) {
          return "Must be a valid number";
        }
        if (numValue < 0) {
          return "Quantity cannot be negative";
        }
        return null; // Valid
      },
      editRender: (value, row, onChange, onSave, onCancel) => {
        const numValue =
          typeof value === "number" ? value : parseFloat(String(value));
        const originalValue = Number(row.qty_used) || 0;
        const needsLocationSelection =
          numValue > 0 && !row.location_id && originalValue <= 0;

        const handleSave = async () => {
          console.log(
            "HandleSave called - needsLocationSelection:",
            needsLocationSelection
          );

          if (needsLocationSelection) {
            // Extract part ID from the row data
            const partId =
              row.part_id ||
              (typeof row.part === "object" && row.part !== null
                ? (row.part as Record<string, unknown>).id
                : row.part);

            console.log(
              "Setting context and fetching locations for part:",
              partId
            );

            // Set context and fetch locations
            setCurrentEditContext({
              rowId: row.id as string | number,
              columnKey: "qty_used",
              newValue: value,
              updatedRow: row,
              partId: partId as string | number,
              onSave: onSave, // Store the onSave callback for later use
            });

            // Fetch locations and show popover
            const fetchedLocations = await fetchLocations(
              partId as string | number
            );
            console.log(
              "About to set popover open, fetched locations count:",
              fetchedLocations.length
            );

            // Calculate and set popover position if we have an input ref
            if (inputRef.current && fetchedLocations.length > 0) {
              const position = calculatePopoverPosition(inputRef.current);
              setPopoverPosition(position);
              setLocationPopoverOpen(true);
              console.log(
                "Location popover set to true with position:",
                position
              );
            } else if (fetchedLocations.length === 0) {
              // No locations available (could be due to error), exit edit mode
              setCurrentEditContext(null);
              console.log("No locations available, exiting edit mode");
            }
            return; // Don't save yet, wait for location selection
          }

          // Normal save if location exists or value is 0
          console.log("Normal save");
          onSave();
        };

        // Debug: console.log("Popover check:", { needsLocationSelection, locationPopoverOpen, shouldShow: needsLocationSelection && locationPopoverOpen && currentEditContext?.rowId === row.id });

        if (
          needsLocationSelection &&
          locationPopoverOpen &&
          currentEditContext?.rowId === row.id
        ) {
          return (
            <div className="flex items-center gap-1 min-w-[120px]">
              <input
                ref={inputRef}
                type="number"
                value={String(value)}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-7 px-2 text-xs border rounded"
                disabled
              />
              <button
                onClick={() => {
                  setLocationPopoverOpen(false);
                  setCurrentEditContext(null);
                  setAvailableLocations([]);
                  setPopoverPosition(null);
                  onCancel();
                }}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 flex items-center justify-center"
              >
                ✗
              </button>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-1 min-w-[120px]">
            <input
              ref={inputRef}
              type="number"
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setPopoverPosition(null);
                  onCancel();
                }
              }}
              className="w-full h-7 px-2 text-xs border rounded"
            />
            <button
              onClick={handleSave}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700 flex items-center justify-center"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setPopoverPosition(null);
                onCancel();
              }}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 flex items-center justify-center"
            >
              ✗
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <InlineEditableApiTable
        endpoint={`/parts/work-order-parts?work_order=${workOrderId}`}
        columns={columns}
        queryKey={["work_order_parts", workOrderId]}
        emptyMessage="No parts assigned to this work order"
        updateEndpoint={(itemId) => `/parts/work-order-parts/${itemId}`}
        updateMode="field"
        hasCreateButton={!isReadOnly}
        createNewText="Add Part"
        onCreateNew={() => setIsPartSelectionDialogOpen(true)}
        onCellUpdate={(rowId, columnKey, newValue, updatedRow) => {
          console.log(`Updated ${columnKey} for row ${rowId}:`, newValue);
        }}
        onCellUpdateError={(rowId, columnKey, error) => {
          console.error(
            `Failed to update ${columnKey} for row ${rowId}:`,
            error
          );
        }}
      />

      {/* Part Selection Dialog */}
      <PartSelectionDialog
        open={isPartSelectionDialogOpen}
        onOpenChange={setIsPartSelectionDialogOpen}
        onConfirm={handlePartsSelection}
        workOrderId={workOrderId}
      />

      {/* Location Selection Popover - rendered outside table structure */}
      {locationPopoverOpen && popoverPosition && (
        <div
          ref={popoverRef}
          className="fixed z-[9999] w-96 bg-background border-2 border-yellow-500 rounded-lg shadow-lg"
          style={{
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
          }}
        >
          <div className="p-1">
            {availableLocations.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2 px-3">
                No locations available for this part
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto">
                {availableLocations.map((location, index) => (
                  <button
                    key={location.id}
                    onClick={() =>
                      handleLocationSelect(location.id, location.name)
                    }
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-yellow-50 hover:border-yellow-400 transition-colors border-b border-yellow-200 focus:outline-none focus:bg-yellow-100 focus:border-yellow-500 ${
                      index === availableLocations.length - 1
                        ? "border-b-0"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">
                        {location.name}
                      </span>
                      {location.qty !== undefined && (
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          Qty: {location.qty}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WorkOrderPartsTab;
