/**
 * ApiTable Component
 * Modular, performant table with sorting, filtering, resizing, and drag-and-drop
 */

import React, { useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2 } from "lucide-react";
import GearSpinner from "@/components/ui/gear-spinner";
import { toast } from "@/hooks/use-toast";
import { SortableTableHead } from "./components/SortableTableHead";
import {
  useTableData,
  useTableFilters,
  useColumnOrder,
  useColumnResize,
} from "./hooks";
import {
  formatDateOptimized,
  formatDateTimeOptimized,
} from "@/utils/dateFormatters";
import type { ApiTableProps, TableColumn } from "./types";

function ApiTableComponent<T extends Record<string, any>>({
  endpoint,
  filters: endpointFilters,
  secondaryEndpoint,
  columns,
  title,
  queryKey,
  className,
  tableClassName,
  emptyMessage = "No data available",
  createNewHref,
  createNewText = "Create",
  onCreateNew,
  hasCreateButton = true,
  secondaryButtonText,
  onSecondaryClick,
  secondaryButtonHref,
  secondaryButtonVariant = "outline",
  editRoutePattern,
  onRowClick,
  onDelete,
  persistColumnOrder = true,
  enableColumnReorder = true,
  tableId,
  height,
  maxHeight,
  showFilters = true,
  refreshInterval,
  enabled = true,
}: ApiTableProps<T>) {
  const navigate = useNavigate();

  // Default create handler when no custom handlers are provided
  const handleDefaultCreate = useCallback(() => {
    toast({
      title: "Create action not configured",
      description:
        "No create handler or route has been configured for this table.",
      variant: "default",
    });
  }, []);

  // Default secondary handler when no custom handlers are provided
  const handleDefaultSecondary = useCallback(() => {
    toast({
      title: "Secondary action not configured",
      description:
        "No secondary button handler or route has been configured for this table.",
      variant: "default",
    });
  }, []);

  // Check if secondary button should be shown
  const showSecondaryButton = Boolean(
    secondaryButtonText && (onSecondaryClick || secondaryButtonHref)
  );

  // Check if any buttons should be shown
  const showAnyButton = hasCreateButton || showSecondaryButton;

  // Custom hooks
  const { data, isLoading, error, isError } = useTableData<T>({
    endpoint,
    secondaryEndpoint,
    filters: endpointFilters,
    queryKey,
    refreshInterval,
    enabled,
    columns,
  });

  const { orderedColumns, handleDragEnd } = useColumnOrder({
    columns,
    persistColumnOrder,
    tableId,
    endpoint,
  });

  const { columnWidths, handleResizeStart } = useColumnResize({
    tableId,
    endpoint,
  });

  const {
    filters,
    appliedFilters,
    openFilterPopover,
    setOpenFilterPopover,
    handleFilterChange,
    applyFilter,
    clearFilter,
    getFilteredData,
  } = useTableFilters({
    data,
    columns: orderedColumns,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoized filtered data
  const filteredData = useMemo(() => getFilteredData(), [getFilteredData]);

  // Simple scroll container ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use filtered data directly (no virtual scrolling complexity)
  const displayData = filteredData;

  // Row click handler
  const handleRowClick = useCallback(
    (row: T) => {
      if (onRowClick) {
        onRowClick(row);
      } else if (editRoutePattern && row.id) {
        const editRoute = editRoutePattern.replace("{id}", row.id.toString());
        navigate(editRoute);
      }
    },
    [onRowClick, editRoutePattern, navigate]
  );

  const isRowClickable = Boolean(onRowClick || editRoutePattern);

  // Cell rendering
  const renderCell = useCallback((column: TableColumn<T>, row: T) => {
    const value = row[column.key];

    // Custom render function takes precedence
    if (column.render) {
      return column.render(value, row);
    }

    // Auto-format based on column type
    if (column.type === "date") {
      return formatDateOptimized(value);
    }

    if (column.type === "datetime" || column.type === "timestamp") {
      return formatDateTimeOptimized(value);
    }

    if (column.type === "object" && value && typeof value === "object") {
      return value.code || value.name || value.id || "-";
    }

    return value?.toString() || "-";
  }, []);

  // Simple container classes - always fill parent and allow overflow
  const containerClassName = `flex flex-col h-full min-h-0 p-0 ${
    className || ""
  }`;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <GearSpinner fullscreen />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load data: {error?.message || "Unknown error"}
        </AlertDescription>
      </Alert>
    );
  }

  // Simplified table content
  const tableContent = (
    <DndContext
      sensors={enableColumnReorder ? sensors : (undefined as any)}
      collisionDetection={enableColumnReorder ? closestCenter : undefined}
      onDragEnd={enableColumnReorder ? handleDragEnd : undefined}
    >
      <div className="flex flex-col h-full">
        {/* Sticky Header */}
        <div className="flex-shrink-0 border-b bg-background">
          <table
            className={`w-full caption-bottom text-sm table-fixed ${
              tableClassName || ""
            }`}
          >
            <TableHeader>
              <TableRow>
                <SortableContext
                  items={orderedColumns.map((col) => col.key)}
                  strategy={horizontalListSortingStrategy}
                >
                  {orderedColumns.map((column, index) => (
                    <SortableTableHead
                      key={column.key}
                      column={column}
                      className={column.className}
                      filterValue={filters[column.key] || ""}
                      onFilterChange={(value) =>
                        handleFilterChange(column.key, value)
                      }
                      onFilterApply={() => applyFilter(column.key)}
                      onFilterClear={() => clearFilter(column.key)}
                      hasActiveFilter={Boolean(appliedFilters[column.key])}
                      openFilterPopover={openFilterPopover}
                      setOpenFilterPopover={setOpenFilterPopover}
                      width={columnWidths[column.key]}
                      onResizeStart={handleResizeStart}
                      isLastColumn={index === orderedColumns.length - 1}
                      enableColumnReorder={enableColumnReorder}
                      showFilters={showFilters}
                    />
                  ))}
                  {onDelete && (
                    <TableHead
                      className="w-8 p-0"
                      style={{ width: "32px" }}
                    ></TableHead>
                  )}
                </SortableContext>
              </TableRow>
            </TableHeader>
          </table>
        </div>

        {/* Scrollable Body */}
        <div ref={scrollContainerRef} className="flex-1 overflow-auto">
          <table
            className={`w-full caption-bottom text-sm table-fixed ${
              tableClassName || ""
            }`}
          >
            <TableBody>
              {displayData && displayData.length > 0 ? (
                displayData.map((row: T, index: number) => (
                  <TableRow
                    key={row.id || index}
                    className={`group ${
                      isRowClickable
                        ? "cursor-pointer hover:bg-muted/50 transition-colors"
                        : ""
                    } relative`}
                    onClick={() => isRowClickable && handleRowClick(row)}
                  >
                    {orderedColumns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={`${column.className} min-w-0`}
                      >
                        <div className="truncate">
                          {renderCell(column, row)}
                        </div>
                      </TableCell>
                    ))}
                    {onDelete && (
                      <TableCell className="w-8 p-0">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(row);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={orderedColumns.length + (onDelete ? 1 : 0)}
                    className="text-center text-muted-foreground"
                  >
                    {Object.keys(appliedFilters).length > 0
                      ? "No results match your filters"
                      : emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
      </div>
    </DndContext>
  );

  // Render buttons
  const renderButtons = () => (
    <>
      {hasCreateButton && (
        <Button
          {...(createNewHref
            ? { asChild: true }
            : { onClick: onCreateNew || handleDefaultCreate })}
          variant="default"
          size="sm"
          className="flex items-center gap-2 px-3 py-1"
        >
          {createNewHref ? (
            <Link to={createNewHref}>
              <Plus className="h-3 w-3" />
              {createNewText}
            </Link>
          ) : (
            <>
              <Plus className="h-3 w-3" />
              {createNewText}
            </>
          )}
        </Button>
      )}
      {showSecondaryButton && (
        <Button
          {...(secondaryButtonHref
            ? { asChild: true }
            : { onClick: onSecondaryClick || handleDefaultSecondary })}
          size="sm"
          variant={secondaryButtonVariant}
          className="flex items-center gap-2 px-3 py-1"
        >
          {secondaryButtonHref ? (
            <Link to={secondaryButtonHref}>{secondaryButtonText}</Link>
          ) : (
            secondaryButtonText
          )}
        </Button>
      )}
    </>
  );

  return (
    <Card className={containerClassName}>
      <CardHeader className="py-2 px-3 flex-shrink-0">
        {(showAnyButton || title) && (
          <div className="flex items-center justify-between min-h-[2rem]">
            {showAnyButton ? (
              renderButtons()
            ) : (
              <h3 className="text-lg font-semibold">{title}</h3>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-3 pt-0 flex-1 min-h-0 flex flex-col">
        {tableContent}
      </CardContent>
    </Card>
  );
}

// Export with proper generic typing
export const ApiTable = React.memo(ApiTableComponent) as <
  T extends Record<string, any>
>(
  props: ApiTableProps<T>
) => JSX.Element;

// Re-export types
export type { ApiTableProps, TableColumn } from "./types";
