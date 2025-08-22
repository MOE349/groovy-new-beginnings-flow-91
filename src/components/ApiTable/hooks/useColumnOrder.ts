/**
 * useColumnOrder Hook
 * Handles column drag-and-drop reordering with persistence
 */

import { useState, useEffect, useCallback } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { TableColumn } from "../types";

interface UseColumnOrderProps<T> {
  columns: TableColumn<T>[];
  persistColumnOrder?: boolean;
  tableId?: string;
  endpoint: string;
}

interface UseColumnOrderReturn<T> {
  orderedColumns: TableColumn<T>[];
  handleDragEnd: (event: DragEndEvent) => void;
  resetColumnOrder: () => void;
}

export function useColumnOrder<
  T extends Record<string, unknown> = Record<string, unknown>
>({
  columns,
  persistColumnOrder = true,
  tableId,
  endpoint,
}: UseColumnOrderProps<T>): UseColumnOrderReturn<T> {
  // Generate storage key for this table
  const storageKey = `table-column-order-${
    tableId || endpoint.replace(/\//g, "-")
  }`;

  // Load saved column order from localStorage
  const getSavedColumnOrder = useCallback((): TableColumn<T>[] => {
    if (!persistColumnOrder) return columns;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedOrder = JSON.parse(saved);
        const currentColumnKeys = columns.map((col) => col.key);

        // Filter out any stored columns that no longer exist (like delete columns)
        const validSavedOrder = savedOrder.filter((savedKey: string) =>
          currentColumnKeys.includes(savedKey)
        );

        // If the saved order changed after filtering, update localStorage
        if (validSavedOrder.length !== savedOrder.length) {
          localStorage.setItem(storageKey, JSON.stringify(validSavedOrder));
        }

        // Reorder columns based on valid saved order
        const orderedColumns = validSavedOrder
          .map((savedKey: string) =>
            columns.find((col) => col.key === savedKey)
          )
          .filter(Boolean);

        // Add any new columns that weren't in the saved order
        const missingColumns = columns.filter(
          (col) => !validSavedOrder.includes(col.key)
        );

        return [...orderedColumns, ...missingColumns];
      }
    } catch (error) {
      console.warn("Failed to load saved column order:", error);
    }

    return columns;
  }, [columns, persistColumnOrder, storageKey]);

  const [orderedColumns, setOrderedColumns] = useState<TableColumn<T>[]>(
    getSavedColumnOrder()
  );

  // Update ordered columns when columns prop changes
  useEffect(() => {
    setOrderedColumns(getSavedColumnOrder());
  }, [columns, getSavedColumnOrder]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        setOrderedColumns((items) => {
          const oldIndex = items.findIndex((item) => item.key === active.id);
          const newIndex = items.findIndex((item) => item.key === over?.id);

          const newOrder = arrayMove(items, oldIndex, newIndex);

          // Save to localStorage if persistence is enabled
          if (persistColumnOrder) {
            try {
              const columnKeys = newOrder.map((col) => col.key);
              localStorage.setItem(storageKey, JSON.stringify(columnKeys));
            } catch (error) {
              console.warn("Failed to save column order:", error);
            }
          }

          return newOrder;
        });
      }
    },
    [persistColumnOrder, storageKey]
  );

  const resetColumnOrder = useCallback(() => {
    setOrderedColumns(columns);
    if (persistColumnOrder) {
      localStorage.removeItem(storageKey);
    }
  }, [columns, persistColumnOrder, storageKey]);

  return {
    orderedColumns,
    handleDragEnd,
    resetColumnOrder,
  };
}
