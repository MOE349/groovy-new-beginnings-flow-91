import React, { memo } from 'react';
import ApiTable, { TableColumn } from './ApiTable';

interface MemoizedApiTableProps<T = Record<string, any>> {
  endpoint: string;
  filters?: Record<string, any>;
  secondaryEndpoint?: string;
  columns: TableColumn<T>[];
  title?: string;
  queryKey?: string[];
  className?: string;
  emptyMessage?: string;
  addButtonText?: string;
  addButtonRoute?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  editRoutePattern?: string;
  deleteRoute?: string;
  showActions?: boolean;
  customActions?: (row: T) => React.ReactNode;
  refreshInterval?: number;
  containerClassName?: string;
  showSearch?: boolean;
  showColumnSelector?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  bulkActions?: Array<{
    label: string;
    action: (selectedItems: T[]) => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
}

// Memoized ApiTable that only re-renders when props actually change
export const MemoizedApiTable = memo(
  <T extends Record<string, any> = Record<string, any>>(
    props: MemoizedApiTableProps<T>
  ) => {
    return <ApiTable {...props} />;
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better performance
    // Only re-render if these specific props change
    return (
      prevProps.endpoint === nextProps.endpoint &&
      JSON.stringify(prevProps.filters) === JSON.stringify(nextProps.filters) &&
      prevProps.columns.length === nextProps.columns.length &&
      prevProps.columns.every((col, idx) => col.key === nextProps.columns[idx].key) &&
      prevProps.queryKey?.join(',') === nextProps.queryKey?.join(',') &&
      prevProps.refreshInterval === nextProps.refreshInterval
    );
  }
) as <T extends Record<string, any> = Record<string, any>>(
  props: MemoizedApiTableProps<T>
) => JSX.Element;

MemoizedApiTable.displayName = 'MemoizedApiTable';

export default MemoizedApiTable;