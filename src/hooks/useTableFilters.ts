import { useState } from "react";
import { TableColumn } from "@/components/ApiTable";

interface UseTableFiltersOptions<T> {
  data: T[] | undefined;
  orderedColumns: TableColumn<T>[];
}

export const useTableFilters = <T extends Record<string, any>>({
  data,
  orderedColumns,
}: UseTableFiltersOptions<T>) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});
  const [openFilterPopover, setOpenFilterPopover] = useState<string | null>(null);

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

  const getFilteredData = (): T[] => {
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

  return {
    filters,
    appliedFilters,
    openFilterPopover,
    setOpenFilterPopover,
    handleFilterChange,
    applyFilter,
    clearFilter,
    getFilteredData,
  };
};