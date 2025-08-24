/**
 * useInlineEditing Hook
 * Manages state and operations for inline table cell editing
 */

import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiCall } from "@/utils/apis";
import { handleApiError } from "@/utils/errorHandling";
import type {
  UseInlineEditingOptions,
  UseInlineEditingReturn,
  EditingState,
  EditableTableColumn,
} from "../types";

export function useInlineEditing<T extends Record<string, unknown>>({
  data,
  columns,
  updateEndpoint,
  onCellUpdate,
  onCellUpdateError,
  updateMode = "field",
  saveDelay = 500,
  queryKey,
}: UseInlineEditingOptions<T>): UseInlineEditingReturn {
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validateValue = useCallback((
    columnKey: string,
    value: string | number
  ): { isValid: boolean; errorMessage: string | null } => {
    const column = columns.find((col) => col.key === columnKey);
    
    if (!column?.validate) {
      return { isValid: true, errorMessage: null };
    }
    
    const errorMessage = column.validate(value);
    return {
      isValid: errorMessage === null,
      errorMessage,
    };
  }, [columns]);

  const startEditing = useCallback((
    rowId: string | number,
    columnKey: string,
    currentValue: unknown
  ) => {
    // Convert value to string for editing
    const stringValue = currentValue?.toString() || "";
    const { isValid, errorMessage } = validateValue(columnKey, stringValue);
    
    setEditingState({
      rowId,
      columnKey,
      originalValue: currentValue,
      currentValue: stringValue,
      isValid,
      errorMessage,
    });
  }, [validateValue]);

  const updateValue = useCallback((newValue: string | number) => {
    if (!editingState) return;

    const { isValid, errorMessage } = validateValue(editingState.columnKey, newValue);
    
    setEditingState(prev => ({
      ...prev!,
      currentValue: newValue,
      isValid,
      errorMessage,
    }));
  }, [editingState, validateValue]);

  const saveEdit = useCallback(async () => {
    if (!editingState || !editingState.isValid || !updateEndpoint || !data) {
      return;
    }

    const { rowId, columnKey, currentValue, originalValue } = editingState;
    
    // Don't save if value hasn't changed
    if (currentValue === originalValue?.toString()) {
      setEditingState(null);
      return;
    }

    try {
      // Find the current row data
      const currentRow = data.find(row => row.id === rowId);
      if (!currentRow) {
        throw new Error("Row not found");
      }

      // Prepare the update data
      let updateData: Record<string, unknown>;
      
      if (updateMode === "field") {
        // Only send the changed field
        updateData = { [columnKey]: currentValue };
      } else {
        // Send the entire row with the updated field
        updateData = { ...currentRow, [columnKey]: currentValue };
      }

      // Make the API call
      const response = await apiCall(updateEndpoint(rowId), {
        method: "PATCH",
        body: updateData,
      });

      // Extract updated row data from response
      const updatedRow = (response as any)?.data?.data || 
                        (response as any)?.data || 
                        { ...currentRow, [columnKey]: currentValue };

      // Invalidate queries to refresh data
      if (queryKey) {
        await queryClient.invalidateQueries({ queryKey });
      }

      // Call success callback
      onCellUpdate?.(rowId, columnKey, currentValue, updatedRow as T);

      // Clear editing state
      setEditingState(null);

      // Show success toast
      toast({
        title: "Updated",
        description: "Cell updated successfully",
      });

    } catch (error: any) {
      console.error("Failed to update cell:", error);
      
      // Call error callback
      onCellUpdateError?.(rowId, columnKey, error);
      
      // Show error message
      handleApiError(error, "Failed to update cell");
    }
  }, [editingState, updateEndpoint, data, updateMode, queryClient, queryKey, onCellUpdate, onCellUpdateError]);

  const cancelEdit = useCallback(() => {
    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    setEditingState(null);
  }, []);

  const isEditing = useCallback((rowId: string | number, columnKey: string) => {
    return editingState?.rowId === rowId && editingState?.columnKey === columnKey;
  }, [editingState]);

  return {
    editingState,
    startEditing,
    updateValue,
    saveEdit,
    cancelEdit,
    isEditing,
  };
}
