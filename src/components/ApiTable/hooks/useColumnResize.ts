/**
 * useColumnResize Hook
 * Handles column resizing with persistence
 */

import { useState, useEffect, useCallback } from "react";
import type { ColumnResizeState } from "../types";

interface UseColumnResizeProps {
  tableId?: string;
  endpoint: string;
  minColumnWidth?: number;
  maxColumnWidth?: number;
}

interface UseColumnResizeReturn {
  columnWidths: Record<string, number>;
  isResizing: boolean;
  resizingColumn: string | null;
  handleResizeStart: (columnKey: string, startX: number) => void;
  resetColumnWidths: () => void;
}

export function useColumnResize({
  tableId,
  endpoint,
  minColumnWidth = 100,
  maxColumnWidth = 800,
}: UseColumnResizeProps): UseColumnResizeReturn {
  const widthStorageKey = `table-column-widths-${tableId || endpoint.replace(/\//g, "-")}`;

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizeState, setResizeState] = useState<ColumnResizeState>({
    isResizing: false,
    resizingColumn: null,
    startX: 0,
    startWidth: 0,
  });

  // Load saved column widths from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(widthStorageKey);
      if (saved) {
        setColumnWidths(JSON.parse(saved));
      }
    } catch (error) {
      console.warn("Failed to load saved column widths:", error);
    }
  }, [widthStorageKey]);

  // Save column widths to localStorage
  const saveColumnWidths = useCallback(
    (widths: Record<string, number>) => {
      try {
        localStorage.setItem(widthStorageKey, JSON.stringify(widths));
      } catch (error) {
        console.warn("Failed to save column widths:", error);
      }
    },
    [widthStorageKey]
  );

  const handleResizeStart = useCallback(
    (columnKey: string, startX: number) => {
      const startWidth = columnWidths[columnKey] || 150; // Default width

      setResizeState({
        isResizing: true,
        resizingColumn: columnKey,
        startX,
        startWidth,
      });

      const handleMouseMove = (e: MouseEvent) => {
        const diff = e.clientX - startX;
        const newWidth = Math.max(
          minColumnWidth,
          Math.min(maxColumnWidth, startWidth + diff)
        );

        setColumnWidths((prev) => {
          const updated = { ...prev, [columnKey]: newWidth };
          return updated;
        });
      };

      const handleMouseUp = () => {
        setResizeState({
          isResizing: false,
          resizingColumn: null,
          startX: 0,
          startWidth: 0,
        });

        // Save the final widths
        setColumnWidths((prev) => {
          saveColumnWidths(prev);
          return prev;
        });

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [columnWidths, minColumnWidth, maxColumnWidth, saveColumnWidths]
  );

  const resetColumnWidths = useCallback(() => {
    setColumnWidths({});
    localStorage.removeItem(widthStorageKey);
  }, [widthStorageKey]);

  return {
    columnWidths,
    isResizing: resizeState.isResizing,
    resizingColumn: resizeState.resizingColumn,
    handleResizeStart,
    resetColumnWidths,
  };
}
