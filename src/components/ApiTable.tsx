import { useNavigate, Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
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

// Custom hooks
import { useTableData } from "@/hooks/useTableData";
import { useColumnOrder } from "@/hooks/useColumnOrder";
import { useColumnResize } from "@/hooks/useColumnResize";
import { useTableFilters } from "@/hooks/useTableFilters";

// Components
import { TableStateHandlers } from "@/components/table/TableStateHandlers";
import { SortableTableHead } from "@/components/table/SortableTableHead";

export interface TableColumn<T = Record<string, any>> {
  key: string;
  header: string;
  type?: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface ApiTableProps<T = Record<string, any>> {
  endpoint: string;
  filters?: Record<string, any>;
  secondaryEndpoint?: string;
  columns: TableColumn<T>[];
  title?: string;
  queryKey?: string[];
  className?: string;
  tableClassName?: string;
  emptyMessage?: string;
  createNewHref?: string;
  createNewText?: string;
  onCreateNew?: () => void;
  editRoutePattern?: string;
  onRowClick?: (row: T) => void;
  onDelete?: (row: T) => void;
  persistColumnOrder?: boolean;
  tableId?: string;
  height?: string;
  maxHeight?: string;
  showFilters?: boolean;
}

const ApiTable = <T extends Record<string, any>>({
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
}: ApiTableProps<T>) => {
  const navigate = useNavigate();

  // Custom hooks
  const { data, isLoading, error, isError } = useTableData<T>({
    endpoint,
    secondaryEndpoint,
    filters: endpointFilters,
    queryKey,
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
    orderedColumns,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredData = getFilteredData();

  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
    } else if (editRoutePattern && row.id) {
      const editRoute = editRoutePattern.replace("{id}", row.id.toString());
      navigate(editRoute);
    }
  };

  const isRowClickable = Boolean(onRowClick || editRoutePattern);

  const renderCell = (column: TableColumn<T>, row: T) => {
    const value = row[column.key];
    if (column.render) {
      return column.render(value, row);
    }
    if (column.type === "object" && value && typeof value === "object") {
      return value.name || value.id || "";
    }
    return value?.toString() || "";
  };

  const content = () => {
    // Handle loading, error, and empty states
    const stateHandler = (
      <TableStateHandlers
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!filteredData || filteredData.length === 0}
        emptyMessage={emptyMessage}
        hasFilters={Object.keys(appliedFilters).length > 0}
      />
    );

    if (isLoading || isError || !filteredData || filteredData.length === 0) {
      return stateHandler;
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div 
          className={`overflow-auto ${height ? `h-[${height}]` : ''} ${maxHeight ? `max-h-[${maxHeight}]` : 'max-h-[400px]'}`}
          style={{ height, maxHeight }}
        >
          <Table className={`table-auto ${tableClassName || ''}`}>
            <TableHeader>
              <TableRow>
                <SortableContext
                  items={orderedColumns.map(col => col.key)} 
                  strategy={horizontalListSortingStrategy}
                >
                  {orderedColumns.map((column, index) => (
                    <SortableTableHead 
                      key={column.key} 
                      column={column} 
                      className={column.className}
                      filterValue={filters[column.key] || ''}
                      onFilterChange={(value) => handleFilterChange(column.key, value)}
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
              {filteredData.map((row: T, index: number) => (
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
                        width: columnWidths[column.key] ? `${columnWidths[column.key]}px` : 'auto',
                        minWidth: columnWidths[column.key] ? `${columnWidths[column.key]}px` : '150px',
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
              ))}
            </TableBody>
          </Table>
        </div>
      </DndContext>
    );
  };

  const tableContent = (
    <Card className={`p-2 ${className}`}>
      {title && (
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            {(createNewHref || onCreateNew) && (
              <Button 
                {...(createNewHref ? { asChild: true } : { onClick: onCreateNew })} 
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
      )}
      <CardContent className="p-0">{content()}</CardContent>
    </Card>
  );

  return tableContent;
};

export default ApiTable;