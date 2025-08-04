import { useState, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { TableColumn } from "@/components/ApiTable";

interface UseColumnOrderOptions<T> {
  columns: TableColumn<T>[];
  persistColumnOrder?: boolean;
  tableId?: string;
  endpoint: string;
}

export const useColumnOrder = <T extends Record<string, any>>({
  columns,
  persistColumnOrder = true,
  tableId,
  endpoint,
}: UseColumnOrderOptions<T>) => {
  // Generate a unique storage key for this table
  const storageKey = `table-column-order-${tableId || endpoint.replace(/\//g, '-')}`;
  
  // Load saved column order from localStorage
  const getSavedColumnOrder = (): TableColumn<T>[] => {
    if (!persistColumnOrder) return columns;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedOrder = JSON.parse(saved);
        // Reorder columns based on saved order, ensuring all columns are present
        const orderedColumns = savedOrder
          .map((savedKey: string) => columns.find(col => col.key === savedKey))
          .filter(Boolean);
        
        // Add any new columns that weren't in the saved order
        const missingColumns = columns.filter(col => 
          !savedOrder.includes(col.key)
        );
        
        return [...orderedColumns, ...missingColumns];
      }
    } catch (error) {
      console.warn('Failed to load saved column order:', error);
    }
    
    return columns;
  };

  const [orderedColumns, setOrderedColumns] = useState<TableColumn<T>[]>(getSavedColumnOrder());

  // Update ordered columns when columns prop changes
  useEffect(() => {
    if (!persistColumnOrder) {
      setOrderedColumns(columns);
    } else {
      setOrderedColumns(getSavedColumnOrder());
    }
  }, [columns]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOrderedColumns((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id);
        const newIndex = items.findIndex((item) => item.key === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save to localStorage if persistence is enabled
        if (persistColumnOrder) {
          try {
            const columnKeys = newOrder.map(col => col.key);
            localStorage.setItem(storageKey, JSON.stringify(columnKeys));
          } catch (error) {
            console.warn('Failed to save column order:', error);
          }
        }
        
        return newOrder;
      });
    }
  };

  return {
    orderedColumns,
    handleDragEnd,
  };
};