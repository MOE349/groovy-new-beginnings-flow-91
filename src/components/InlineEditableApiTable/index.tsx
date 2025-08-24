/**
 * InlineEditableApiTable Component
 * Extends ApiTable with inline cell editing capabilities
 */

import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X } from "lucide-react";
import { ApiTable } from "@/components/ApiTable";
import { useTableData } from "@/components/ApiTable/hooks";
import { useInlineEditing } from "./hooks/useInlineEditing";
import type { InlineEditableApiTableProps, EditableTableColumn } from "./types";
import type { TableColumn } from "@/components/ApiTable/types";

function InlineEditableApiTableComponent<T extends Record<string, unknown>>({
  columns: editableColumns,
  updateEndpoint,
  onCellUpdate,
  onCellUpdateError,
  updateMode = "field",
  saveDelay = 500,
  ...apiTableProps
}: InlineEditableApiTableProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLButtonElement>(null);

  // Get the table data to pass to the useInlineEditing hook
  const { data } = useTableData<T>({
    endpoint: apiTableProps.endpoint,
    secondaryEndpoint: apiTableProps.secondaryEndpoint,
    filters: apiTableProps.filters,
    queryKey: apiTableProps.queryKey,
    refreshInterval: apiTableProps.refreshInterval,
    enabled: apiTableProps.enabled,
    columns: editableColumns,
  });

  const {
    editingState,
    startEditing,
    updateValue,
    saveEdit,
    cancelEdit,
    isEditing,
  } = useInlineEditing<T>({
    data,
    columns: editableColumns,
    updateEndpoint,
    onCellUpdate,
    onCellUpdateError,
    updateMode,
    saveDelay,
    queryKey: apiTableProps.queryKey,
  });

  // Focus input when editing starts (only when starting to edit a new cell)
  useEffect(() => {
    if (editingState) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        } else if (selectRef.current) {
          selectRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [editingState?.rowId, editingState?.columnKey]); // Only run when editing a different cell

  // Handle keyboard events for editing
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!editingState) return;

      switch (e.key) {
        case "Enter":
          e.preventDefault();
          if (editingState.isValid) {
            saveEdit();
          }
          break;
        case "Escape":
          e.preventDefault();
          cancelEdit();
          break;
      }
    },
    [editingState, saveEdit, cancelEdit]
  );

  // Render editing cell component
  const renderEditingCell = useCallback(
    (column: EditableTableColumn<T>, row: T) => {
      if (!editingState || !isEditing(row.id as string | number, column.key)) {
        return null;
      }

      const { currentValue, isValid, errorMessage } = editingState;

      // Custom edit renderer
      if (column.editRender) {
        return column.editRender(
          currentValue,
          row,
          updateValue,
          saveEdit,
          cancelEdit
        );
      }

      // Default renderers based on editType
      switch (column.editType) {
        case "select":
          return (
            <div className="flex items-center gap-1 min-w-[120px]">
              <Select
                value={String(currentValue)}
                onValueChange={(value) => updateValue(value)}
              >
                <SelectTrigger ref={selectRef} className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {column.editOptions?.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                onClick={saveEdit}
                disabled={!isValid}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                onClick={cancelEdit}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );

        case "number":
          return (
            <div className="flex items-center gap-1 min-w-[100px]">
              <Input
                ref={inputRef}
                type="number"
                value={String(currentValue)}
                onChange={(e) => updateValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={saveEdit}
                className={`h-7 text-xs ${!isValid ? "border-red-500" : ""}`}
                title={errorMessage || undefined}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                onClick={saveEdit}
                disabled={!isValid}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                onClick={cancelEdit}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );

        case "date":
          return (
            <div className="flex items-center gap-1 min-w-[140px]">
              <Input
                ref={inputRef}
                type="date"
                value={String(currentValue)}
                onChange={(e) => updateValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={saveEdit}
                className={`h-7 text-xs ${!isValid ? "border-red-500" : ""}`}
                title={errorMessage || undefined}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                onClick={saveEdit}
                disabled={!isValid}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                onClick={cancelEdit}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );

        default:
        case "text":
          return (
            <div className="flex items-center gap-1 min-w-[120px]">
              <Input
                ref={inputRef}
                type="text"
                value={String(currentValue)}
                onChange={(e) => updateValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={saveEdit}
                className={`h-7 text-xs ${!isValid ? "border-red-500" : ""}`}
                title={errorMessage || undefined}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                onClick={saveEdit}
                disabled={!isValid}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                onClick={cancelEdit}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
      }
    },
    [editingState, isEditing, updateValue, saveEdit, cancelEdit, handleKeyDown]
  );

  // Transform editable columns to regular ApiTable columns with custom render functions
  const transformedColumns = useMemo((): TableColumn<T>[] => {
    return editableColumns.map((column) => ({
      ...column,
      render: (value: unknown, row: T) => {
        const rowId = row.id as string | number;
        const isCurrentlyEditing = isEditing(rowId, column.key);

        // Show editing component if this cell is being edited
        if (isCurrentlyEditing) {
          return renderEditingCell(column, row);
        }

        // Show regular cell content with click handler for editable columns
        if (column.editable && updateEndpoint) {
          return (
            <div
              className="cursor-pointer hover:bg-muted/20 rounded px-1 py-0.5 transition-colors min-h-[1.5rem] flex items-center group"
              onClick={(e) => {
                e.stopPropagation();
                startEditing(rowId, column.key, value);
              }}
              title="Click to edit"
            >
              <span className="group-hover:opacity-75">
                {column.render
                  ? column.render(value, row)
                  : String(value || "-")}
              </span>
            </div>
          );
        }

        // Regular non-editable cell
        return column.render ? column.render(value, row) : String(value || "-");
      },
    }));
  }, [
    editableColumns,
    isEditing,
    renderEditingCell,
    updateEndpoint,
    startEditing,
  ]);

  return <ApiTable<T> {...apiTableProps} columns={transformedColumns} />;
}

// Export with proper generic typing
export const InlineEditableApiTable = React.memo(
  InlineEditableApiTableComponent
) as <T extends Record<string, unknown>>(
  props: InlineEditableApiTableProps<T>
) => JSX.Element;

// Re-export types
export type { InlineEditableApiTableProps, EditableTableColumn } from "./types";
