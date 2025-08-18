/**
 * SortableTableHead Component
 * Handles sortable, filterable, and resizable table headers
 */

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { GripVertical, Search } from "lucide-react";
import { FilterPopover } from "./FilterPopover";
import type { TableColumn } from "../types";

interface SortableTableHeadProps {
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
  enableColumnReorder?: boolean;
  showFilters?: boolean;
}

export const SortableTableHead: React.FC<SortableTableHeadProps> = ({
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
  showFilters = true,
  enableColumnReorder = true,
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
        width: width ? `${width}px` : "auto",
        minWidth: width ? `${width}px` : "150px",
      }}
      className={`${className} select-none relative text-secondary`}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div
          className={`flex items-center gap-2 min-w-0 ${
            enableColumnReorder ? "cursor-grab active:cursor-grabbing" : ""
          }`}
          {...(enableColumnReorder ? { ...attributes, ...listeners } : {})}
        >
          {enableColumnReorder && (
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          <span className="truncate">{column.header}</span>
        </div>

        {showFilters && column.filterable !== false && (
          <div className="flex-shrink-0">
            <Popover
              open={isPopoverOpen}
              onOpenChange={(open) =>
                setOpenFilterPopover(open ? column.key : null)
              }
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 ${
                    hasActiveFilter
                      ? "text-primary ring-2 ring-secondary ring-offset-4"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={handleSearchClick}
                >
                  <Search className="h-3 w-3" />
                </Button>
              </PopoverTrigger>

              <FilterPopover
                filterValue={filterValue}
                onFilterChange={onFilterChange}
                onApply={onFilterApply}
                onClear={onFilterClear}
                onOpenChange={(open) =>
                  setOpenFilterPopover(open ? column.key : null)
                }
              />
            </Popover>
          </div>
        )}
      </div>

      {/* Resize handle */}
      {!isLastColumn && (
        <div
          className="absolute top-0 right-0 w-px h-full cursor-col-resize bg-white/30 hover:bg-white/50 hover:w-0.5 transition-all"
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
