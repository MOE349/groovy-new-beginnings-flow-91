/**
 * ApiTable Component
 * Modular, performant table with sorting, filtering, resizing, and drag-and-drop
 */

import React, {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2 } from "lucide-react";
import GearSpinner from "@/components/ui/gear-spinner";
import { SortableTableHead } from "./components/SortableTableHead";
import {
  useTableData,
  useTableFilters,
  useColumnOrder,
  useColumnResize,
  useVirtualScroll,
} from "./hooks";
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
  createNewText = "Create New",
  onCreateNew,
  editRoutePattern,
  onRowClick,
  onDelete,
  persistColumnOrder = true,
  tableId,
  height,
  maxHeight,
  showFilters = true,
  refreshInterval,
  virtualScroll = false,
  rowHeight = 40,
}: ApiTableProps<T>) {
  const navigate = useNavigate();

  // Custom hooks
  const { data, isLoading, error, isError } = useTableData<T>({
    endpoint,
    secondaryEndpoint,
    filters: endpointFilters,
    queryKey,
    refreshInterval,
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

  // Container height tracking for virtual scrolling
  const [containerHeight, setContainerHeight] = useState(400);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update container height when it changes
  useEffect(() => {
    const updateHeight = () => {
      if (scrollContainerRef.current && virtualScroll) {
        const rect = scrollContainerRef.current.getBoundingClientRect();
        setContainerHeight(rect.height);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [virtualScroll]);

  // Virtual scrolling
  const {
    virtualItems,
    totalHeight,
    offsetY,
    handleScroll: handleVirtualScroll,
    startIndex,
  } = useVirtualScroll({
    items: filteredData || [],
    containerHeight,
    rowHeight,
    overscan: 5,
    enabled: virtualScroll,
  });

  // Use virtual items when virtual scrolling is enabled
  const displayData = virtualScroll ? virtualItems : filteredData;

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
    if (column.render) {
      return column.render(value, row);
    }
    if (column.type === "object" && value && typeof value === "object") {
      return value.name || value.id || "";
    }
    return value?.toString() || "";
  }, []);

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

  // Table content
  const tableContent = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={virtualScroll ? scrollContainerRef : undefined}
        className={`overflow-auto ${height || maxHeight || "max-h-[400px]"}`}
        style={{ height, maxHeight }}
        onScroll={virtualScroll ? handleVirtualScroll : undefined}
      >
        {virtualScroll ? (
          // Virtual scrolling table
          <div style={{ height: totalHeight, position: "relative" }}>
            <Table
              className={`table-auto ${tableClassName || ""}`}
              style={{
                position: "absolute",
                top: offsetY,
                left: 0,
                right: 0,
              }}
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
                        showFilters={showFilters}
                      />
                    ))}
                  </SortableContext>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData && displayData.length > 0 ? (
                  displayData.map((row: T, index: number) => (
                    <TableRow
                      key={row.id || startIndex + index}
                      className={`group ${isRowClickable ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""} relative`}
                      onClick={() => isRowClickable && handleRowClick(row)}
                    >
                      {orderedColumns.map((column) => (
                        <TableCell
                          key={column.key}
                          className={`${column.className} min-w-0`}
                          style={{
                            width: columnWidths[column.key]
                              ? `${columnWidths[column.key]}px`
                              : "auto",
                            minWidth: columnWidths[column.key]
                              ? `${columnWidths[column.key]}px`
                              : "150px",
                          }}
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
            </Table>
          </div>
        ) : (
          // Regular non-virtual scrolling table
          <Table className={`table-auto ${tableClassName || ""}`}>
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
                      showFilters={showFilters}
                    />
                  ))}
                </SortableContext>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData && filteredData.length > 0 ? (
                filteredData.map((row: T, index: number) => (
                  <TableRow
                    key={row.id || index}
                    className={`group ${isRowClickable ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""} relative`}
                    onClick={() => isRowClickable && handleRowClick(row)}
                  >
                    {orderedColumns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={`${column.className} min-w-0`}
                        style={{
                          width: columnWidths[column.key]
                            ? `${columnWidths[column.key]}px`
                            : "auto",
                          minWidth: columnWidths[column.key]
                            ? `${columnWidths[column.key]}px`
                            : "150px",
                        }}
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
          </Table>
        )}
      </div>
    </DndContext>
  );

  // With title/card wrapper
  if (title) {
    return (
      <Card className={`p-2 ${className}`}>
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between">
            {(createNewHref || onCreateNew) && (
              <Button
                {...(createNewHref
                  ? { asChild: true }
                  : { onClick: onCreateNew })}
                size="sm"
              >
                {createNewHref ? (
                  <Link to={createNewHref}>
                    <Plus className="mr-2 h-4 w-4" />
                    {createNewText}
                  </Link>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {createNewText}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">{tableContent}</CardContent>
      </Card>
    );
  }

  // Without title
  return (
    <Card className={`p-2 ${className}`}>
      <CardContent className="p-0">{tableContent}</CardContent>
    </Card>
  );
}

// Export with proper generic typing
export const ApiTable = React.memo(ApiTableComponent) as <
  T extends Record<string, any>,
>(
  props: ApiTableProps<T>
) => JSX.Element;

// Re-export types
export type { ApiTableProps, TableColumn } from "./types";
