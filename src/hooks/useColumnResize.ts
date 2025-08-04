import { useState, useEffect } from "react";

interface UseColumnResizeOptions {
  tableId?: string;
  endpoint: string;
}

export const useColumnResize = ({
  tableId,
  endpoint,
}: UseColumnResizeOptions) => {
  const widthStorageKey = `table-column-widths-${tableId || endpoint.replace(/\//g, '-')}`;
  
  // Column resizing state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  
  // Load saved column widths from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(widthStorageKey);
      if (saved) {
        setColumnWidths(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load saved column widths:', error);
    }
  }, [widthStorageKey]);

  // Save column widths to localStorage
  const saveColumnWidths = (widths: Record<string, number>) => {
    try {
      localStorage.setItem(widthStorageKey, JSON.stringify(widths));
    } catch (error) {
      console.warn('Failed to save column widths:', error);
    }
  };

  // Handle column resize
  const handleColumnResize = (columnKey: string, width: number) => {
    const newWidths = { ...columnWidths, [columnKey]: Math.max(width, 100) }; // Minimum width of 100px
    setColumnWidths(newWidths);
    saveColumnWidths(newWidths);
  };

  // Handle resize start
  const handleResizeStart = (columnKey: string, startX: number) => {
    setIsResizing(true);
    setResizingColumn(columnKey);
    
    const startWidth = columnWidths[columnKey] || 150; // Default width
    
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = startWidth + diff;
      handleColumnResize(columnKey, newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return {
    columnWidths,
    isResizing,
    resizingColumn,
    handleResizeStart,
  };
};