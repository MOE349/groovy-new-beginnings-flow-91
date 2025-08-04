/**
 * ApiTable Types
 * Comprehensive type definitions for the table component
 */

export interface TableColumn<T = any> {
  key: string;
  header: string;
  type?: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
}

export interface ApiTableProps<T = any> {
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
  refreshInterval?: number;
  virtualScroll?: boolean;
  rowHeight?: number | ((row: T, index: number) => number);
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
  data: T[] | { data: T[]; meta_data?: any };
  status: number;
  statusText: string;
}

export interface UseTableDataOptions<T> {
  endpoint: string;
  secondaryEndpoint?: string;
  filters?: Record<string, any>;
  queryKey?: string[];
  refreshInterval?: number;
  enabled?: boolean;
}

export interface UseTableDataReturn<T> {
  data: T[] | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}
