/**
 * ApiTable Types
 * Comprehensive type definitions for the table component
 */

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  type?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  /**
   * For object-type columns, specifies the key where the object's ID should be stored.
   * If not provided, defaults to `${key}_id`
   * Example: column key "location" with objectIdKey "location_id" will store the object's ID in row.location_id
   */
  objectIdKey?: string;
}

export interface ApiTableProps<T = Record<string, unknown>> {
  endpoint: string;
  filters?: Record<string, unknown>;
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
  hasCreateButton?: boolean;
  secondaryButtonText?: string;
  onSecondaryClick?: () => void;
  secondaryButtonHref?: string;
  secondaryButtonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  editRoutePattern?: string;
  onRowClick?: (row: T) => void;
  onDelete?: (row: T) => void;
  persistColumnOrder?: boolean;
  enableColumnReorder?: boolean;
  tableId?: string;
  height?: string;
  maxHeight?: string;
  showFilters?: boolean;
  refreshInterval?: number;
  enabled?: boolean;
}

export interface TableState {
  sorting: SortingState;
  filtering: FilteringState;
  columnOrder: string[];
  columnWidths: Record<string, number>;
  selectedRows: Set<string>;
}

export interface SortingState {
  column: string | null;
  direction: "asc" | "desc" | null;
}

export interface FilteringState {
  filters: Record<string, string>;
  appliedFilters: Record<string, string>;
  openPopover: string | null;
}

export interface ColumnResizeState {
  isResizing: boolean;
  resizingColumn: string | null;
  startX: number;
  startWidth: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface TableDataResponse<T> {
  data: T[] | { data: T[]; meta_data?: Record<string, unknown> };
  status: number;
  statusText: string;
}

export interface UseTableDataOptions<T> {
  endpoint: string;
  secondaryEndpoint?: string;
  filters?: Record<string, unknown>;
  queryKey?: string[];
  refreshInterval?: number;
  enabled?: boolean;
  columns?: TableColumn<T>[];
}

export interface UseTableDataReturn<T> {
  data: T[] | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}
