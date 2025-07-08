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
import { Plus, GripVertical } from "lucide-react";
import { apiGet } from "@/utils/apis";
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
  emptyMessage?: string;
  createNewHref?: string;
  createNewText?: string;
  editRoutePattern?: string; // e.g., "/assets/edit/{id}"
  onRowClick?: (row: T) => void;
}

// Sortable header component
const SortableTableHead = ({ column, className }: { column: TableColumn; className?: string }) => {
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

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={`${className} cursor-grab active:cursor-grabbing select-none`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        {column.header}
      </div>
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
  emptyMessage = "No data available",
  createNewHref,
  createNewText = "Create New",
  editRoutePattern,
  onRowClick,
}: ApiTableProps<T>) => {
  const navigate = useNavigate();
  const [orderedColumns, setOrderedColumns] = useState<TableColumn<T>[]>(columns);

  // Update ordered columns when columns prop changes
  useEffect(() => {
    setOrderedColumns(columns);
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

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  const {
    data,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: queryKey || (secondaryEndpoint ? [endpoint, secondaryEndpoint] : [endpoint]),
    queryFn: async () => {
      const promises = [apiGet(endpoint)];
      
      // Add secondary endpoint if provided
      if (secondaryEndpoint) {
        promises.push(apiGet(secondaryEndpoint));
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableContext 
                  items={orderedColumns.map(col => col.key)} 
                  strategy={horizontalListSortingStrategy}
                >
                  {orderedColumns.map((column) => (
                    <SortableTableHead 
                      key={column.key} 
                      column={column} 
                      className={column.className} 
                    />
                  ))}
                </SortableContext>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((row: T, index: number) => (
                  <TableRow 
                    key={row.id || index}
                    className={`group ${isRowClickable ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}`}
                    onClick={() => isRowClickable && handleRowClick(row)}
                  >
                    {orderedColumns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {renderCell(column, row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={orderedColumns.length} className="text-center py-8 text-muted-foreground">
                    {emptyMessage}
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
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            {createNewHref && (
              <Button asChild size="sm">
                <Link to={createNewHref}>
                  <Plus className="mr-2 h-4 w-4" />
                  {createNewText}
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>{content()}</CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">{content()}</CardContent>
    </Card>
  );
};

export default ApiTable;