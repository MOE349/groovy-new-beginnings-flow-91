/**
 * useTableFilters Hook
 * Handles filtering logic for ApiTable
 */

import { useState, useCallback, useMemo } from "react";
import type { TableColumn, FilteringState } from "../types";

interface UseTableFiltersProps<T> {
  data: T[] | null;
  columns: TableColumn<T>[];
}

interface UseTableFiltersReturn<T> {
  filters: Record<string, string>;
  appliedFilters: Record<string, string>;
  openFilterPopover: string | null;
  setOpenFilterPopover: (key: string | null) => void;
  handleFilterChange: (columnKey: string, value: string) => void;
  applyFilter: (columnKey: string) => void;
  clearFilter: (columnKey: string) => void;
  clearAllFilters: () => void;
  getFilteredData: () => T[];
  hasActiveFilters: boolean;
}

export function useTableFilters<T = any>({
  data,
  columns,
}: UseTableFiltersProps<T>): UseTableFiltersReturn<T> {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>(
    {}
  );
  const [openFilterPopover, setOpenFilterPopover] = useState<string | null>(
    null
  );

  const handleFilterChange = useCallback((columnKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnKey]: value }));

    // Auto-clear if empty
    if (value === "") {
      setAppliedFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters[columnKey];
        return newFilters;
      });
    }
  }, []);

  const applyFilter = useCallback(
    (columnKey: string) => {
      const filterValue = filters[columnKey] || "";

      if (filterValue === "") {
        setAppliedFilters((prev) => {
          const newFilters = { ...prev };
          delete newFilters[columnKey];
          return newFilters;
        });
      } else {
        setAppliedFilters((prev) => ({ ...prev, [columnKey]: filterValue }));
      }
    },
    [filters]
  );

  const clearFilter = useCallback((columnKey: string) => {
    setFilters((prev) => ({ ...prev, [columnKey]: "" }));
    setAppliedFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setAppliedFilters({});
  }, []);

  const getFilteredData = useCallback(() => {
    if (!data || Object.keys(appliedFilters).length === 0) {
      return data || [];
    }

    return data.filter((row: T) => {
      return Object.entries(appliedFilters).every(
        ([columnKey, filterValue]) => {
          if (!filterValue) return true;

          const column = columns.find((col) => col.key === columnKey);
          if (!column) return true;

          let cellValue = "";

          // Extract cell value
          if (column.render) {
            const renderedValue = column.render(row[columnKey], row);
            if (typeof renderedValue === "string") {
              cellValue = renderedValue;
            } else if (
              renderedValue &&
              typeof renderedValue === "object" &&
              "props" in renderedValue
            ) {
              cellValue = String(renderedValue.props.children || "");
            } else {
              cellValue = String(renderedValue || "");
            }
          } else if (
            column.type === "object" &&
            row[columnKey] &&
            typeof row[columnKey] === "object"
          ) {
            cellValue = row[columnKey].name || row[columnKey].id || "";
          } else {
            cellValue = String(row[columnKey] || "");
          }

          return cellValue.toLowerCase().includes(filterValue.toLowerCase());
        }
      );
    });
  }, [data, appliedFilters, columns]);

  const hasActiveFilters = useMemo(
    () => Object.keys(appliedFilters).length > 0,
    [appliedFilters]
  );

  return {
    filters,
    appliedFilters,
    openFilterPopover,
    setOpenFilterPopover,
    handleFilterChange,
    applyFilter,
    clearFilter,
    clearAllFilters,
    getFilteredData,
    hasActiveFilters,
  };
}
