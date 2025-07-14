import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Plus, GripVertical, Search } from "lucide-react";
import { apiCall } from "@/utils/apis";
import GearSpinner from "@/components/ui/gear-spinner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface TableColumn<T = any> {
  key: string;
  header: string;
  type?: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface ApiTableProps<T = any> {
  endpoint: string;
  secondaryEndpoint?: string; // Optional secondary endpoint to fetch additional data
  columns: TableColumn<T>[];
  title?: string;
  queryKey?: string[];
  className?: string;
  tableClassName?: string; // Applied directly to the Table component
  emptyMessage?: string;
  createNewHref?: string;
  createNewText?: string;
  onCreateNew?: () => void; // New callback for handling create action
  editRoutePattern?: string; // e.g., "/assets/edit/{id}"
  onRowClick?: (row: T) => void;
  persistColumnOrder?: boolean; // Enable column order persistence
  tableId?: string; // Unique identifier for localStorage key
}

// Filter popover component
const FilterPopover = ({
  isOpen,
  onOpenChange,
  filterValue,
  onFilterChange,
  onApply,
  onClear,
  hasActiveFilter,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  hasActiveFilter: boolean;
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onApply();
      onOpenChange(false);
    }
    if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  return (
    <PopoverContent className="w-64 p-3" align="start">
      <div className="space-y-3">
        <Input
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Filter..."
          className="h-8"
          autoFocus
        />
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => {
              onApply();
              onOpenChange(false);
            }}
            className="flex-1"
          >
            Apply
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              onClear();
              onOpenChange(false);
            }}
            className="flex-1"
          >
            Clear
          </Button>
        </div>
      </div>
    </PopoverContent>
  );
};

// Sortable header component
const SortableTableHead = ({ 
  column, 
  className, 
  filterValue, 
  onFilterChange, 
  onFilterApply,
  onFilterClear,
  hasActiveFilter,
  openFilterPopover,
  setOpenFilterPopover,
  width,
  onResizeStart,
  isLastColumn,
}: { 
  column: TableColumn; 
  className?: string;
  filterValue: string;
  onFilterChange: (value: string) => void;
  onFilterApply: () => void;
  onFilterClear: () => void;
  hasActiveFilter: boolean;
  openFilterPopover: string | null;
  setOpenFilterPopover: (key: string | null) => void;
  width?: number;
  onResizeStart: (columnKey: string, startX: number) => void;
  isLastColumn: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isPopoverOpen = openFilterPopover === column.key;

  const handleSearchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenFilterPopover(isPopoverOpen ? null : column.key);
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={{
        ...style,
        width: width ? `${width}px` : 'auto',
        minWidth: width ? `${width}px` : '150px',
      }}
      className={`${className} select-none relative`}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{column.header}</span>
        </div>
        
        <div className="flex-shrink-0">
          <Popover open={isPopoverOpen} onOpenChange={(open) => setOpenFilterPopover(open ? column.key : null)}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${hasActiveFilter ? 'text-primary ring-2 ring-secondary ring-offset-4' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={handleSearchClick}
              >
                <Search className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            
            <FilterPopover
              isOpen={isPopoverOpen}
              onOpenChange={(open) => setOpenFilterPopover(open ? column.key : null)}
              filterValue={filterValue}
              onFilterChange={onFilterChange}
              onApply={onFilterApply}
              onClear={onFilterClear}
              hasActiveFilter={hasActiveFilter}
            />
          </Popover>
        </div>
      </div>
      
      {/* Resize handle */}
      {!isLastColumn && (
        <div
          className="absolute top-0 right-0 w-px h-full cursor-col-resize bg-secondary/30 hover:bg-secondary/50 hover:w-0.5 transition-all"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onResizeStart(column.key, e.clientX);
          }}
        />
      )}
    </TableHead>
  );
};

const ApiTable = <T extends Record<string, any>>({
  endpoint,
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
  persistColumnOrder = true,
  tableId,
}: ApiTableProps<T>) => {
  const navigate = useNavigate();
  
  // Generate a unique storage key for this table
  const storageKey = `table-column-order-${tableId || endpoint.replace(/\//g, '-')}`;
  const widthStorageKey = `table-column-widths-${tableId || endpoint.replace(/\//g, '-')}`;
  
  // Column resizing state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  
  // Load saved column widths from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(widthStorageKey);
      if (saved) {
        setColumnWidths(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load saved column widths:', error);
    }
  }, [widthStorageKey]);

  // Save column widths to localStorage
  const saveColumnWidths = (widths: Record<string, number>) => {
    try {
      localStorage.setItem(widthStorageKey, JSON.stringify(widths));
    } catch (error) {
      console.warn('Failed to save column widths:', error);
    }
  };

  // Handle column resize
  const handleColumnResize = (columnKey: string, width: number) => {
    const newWidths = { ...columnWidths, [columnKey]: Math.max(width, 100) }; // Minimum width of 100px
    setColumnWidths(newWidths);
    saveColumnWidths(newWidths);
  };

  // Handle resize start
  const handleResizeStart = (columnKey: string, startX: number) => {
    setIsResizing(true);
    setResizingColumn(columnKey);
    
    const startWidth = columnWidths[columnKey] || 150; // Default width
    
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = startWidth + diff;
      handleColumnResize(columnKey, newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Load saved column order from localStorage
  const getSavedColumnOrder = (): TableColumn<T>[] => {
    if (!persistColumnOrder) return columns;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedOrder = JSON.parse(saved);
        // Reorder columns based on saved order, ensuring all columns are present
        const orderedColumns = savedOrder
          .map((savedKey: string) => columns.find(col => col.key === savedKey))
          .filter(Boolean);
        
        // Add any new columns that weren't in the saved order
        const missingColumns = columns.filter(col => 
          !savedOrder.includes(col.key)
        );
        
        return [...orderedColumns, ...missingColumns];
      }
    } catch (error) {
      console.warn('Failed to load saved column order:', error);
    }
    
    return columns;
  };

  const [orderedColumns, setOrderedColumns] = useState<TableColumn<T>[]>(getSavedColumnOrder());
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});
  const [openFilterPopover, setOpenFilterPopover] = useState<string | null>(null);

  // Update ordered columns when columns prop changes
  useEffect(() => {
    if (!persistColumnOrder) {
      setOrderedColumns(columns);
    } else {
      setOrderedColumns(getSavedColumnOrder());
    }
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOrderedColumns((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id);
        const newIndex = items.findIndex((item) => item.key === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save to localStorage if persistence is enabled
        if (persistColumnOrder) {
          try {
            const columnKeys = newOrder.map(col => col.key);
            localStorage.setItem(storageKey, JSON.stringify(columnKeys));
          } catch (error) {
            console.warn('Failed to save column order:', error);
          }
        }
        
        return newOrder;
      });
    }
  };

  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({ ...prev, [columnKey]: value }));
    if (value === '') {
      setAppliedFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters[columnKey];
        return newFilters;
      });
    }
  };

  const applyFilter = (columnKey: string) => {
    const filterValue = filters[columnKey] || '';
    if (filterValue === '') {
      setAppliedFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters[columnKey];
        return newFilters;
      });
    } else {
      setAppliedFilters(prev => ({ ...prev, [columnKey]: filterValue }));
    }
  };

  const clearFilter = (columnKey: string) => {
    setFilters(prev => ({ ...prev, [columnKey]: '' }));
    setAppliedFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
  };

  const {
    data,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: queryKey || (secondaryEndpoint ? [endpoint, secondaryEndpoint] : [endpoint]),
    queryFn: async () => {
      const promises = [apiCall(endpoint)];
      
      // Add secondary endpoint if provided
      if (secondaryEndpoint) {
        promises.push(apiCall(secondaryEndpoint));
      }
      
      const responses = await Promise.all(promises);
      
      // Extract data from responses
      const primaryData = responses[0].data.data || responses[0].data;
      const secondaryData = secondaryEndpoint && responses[1] 
        ? responses[1].data.data || responses[1].data 
        : [];
      
      // Add source metadata to each row
      const primaryWithSource = Array.isArray(primaryData) 
        ? primaryData.map((item: any) => ({ ...item, _dataSource: 'primary' }))
        : [];
        
      const secondaryWithSource = Array.isArray(secondaryData) 
        ? secondaryData.map((item: any) => ({ ...item, _dataSource: 'secondary' }))
        : [];
      
      // Combine data arrays
      return [...primaryWithSource, ...secondaryWithSource];
    },
  });

  const getFilteredData = () => {
    if (!data || Object.keys(appliedFilters).length === 0) {
      return data || [];
    }

    return data.filter((row: T) => {
      return Object.entries(appliedFilters).every(([columnKey, filterValue]) => {
        if (!filterValue) return true;
        
        const column = orderedColumns.find(col => col.key === columnKey);
        if (!column) return true;

        let cellValue = '';
        
        if (column.render) {
          const renderedValue = column.render(row[columnKey], row);
          if (typeof renderedValue === 'string') {
            cellValue = renderedValue;
          } else if (renderedValue && typeof renderedValue === 'object' && 'props' in renderedValue) {
            cellValue = String(renderedValue.props.children || '');
          } else {
            cellValue = String(renderedValue || '');
          }
        } else if (column.type === "object" && row[columnKey] && typeof row[columnKey] === "object") {
          cellValue = row[columnKey].name || row[columnKey].id || '';
        } else {
          cellValue = String(row[columnKey] || '');
        }

        return cellValue.toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  };

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

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <GearSpinner fullscreen />
    </div>
  );

  const ErrorAlert = () => (
    <Alert variant="destructive">
      <AlertDescription>
        Failed to load data: {error?.message || "Unknown error"}
      </AlertDescription>
    </Alert>
  );

  const EmptyState = () => (
    <div className="text-center py-8 text-muted-foreground">
      {emptyMessage}
    </div>
  );

  const content = () => {
    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorAlert />;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-auto h-[calc(100vh-8rem)] max-w-full">
          <Table className={`table-fixed ${tableClassName || ''}`}>
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
                    className={`group ${isRowClickable ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}`}
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={orderedColumns.length} className="text-center text-muted-foreground">
                    {Object.keys(appliedFilters).length > 0 ? "No results match your filters" : emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>
    );
  };

  if (title) {
    return (
      <Card className={`p-2 ${className}`}>
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
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
        <CardContent className="p-0">{content()}</CardContent>
      </Card>
    );
  }

  return (
    <Card className={`p-2 ${className}`}>
      <CardContent className="p-0">
        {content()}
      </CardContent>
    </Card>
  );
};

export default ApiTable;