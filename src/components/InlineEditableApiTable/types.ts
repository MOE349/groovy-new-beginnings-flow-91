/**
 * InlineEditableApiTable Types
 * Extended types for inline editing functionality
 */

import type { ApiTableProps, TableColumn } from "@/components/ApiTable/types";

export interface EditableTableColumn<T = Record<string, unknown>> extends TableColumn<T> {
  /**
   * Whether this column is editable in inline mode
   */
  editable?: boolean;
  
  /**
   * Type of input to show when editing
   */
  editType?: "text" | "number" | "select" | "date";
  
  /**
   * Options for select type editing
   */
  editOptions?: Array<{ value: string | number; label: string }>;
  
  /**
   * Validation function for the cell value
   */
  validate?: (value: string | number) => string | null;
  
  /**
   * Custom edit renderer (optional)
   */
  editRender?: (
    value: unknown,
    row: T,
    onChange: (newValue: string | number) => void,
    onSave: () => void,
    onCancel: () => void
  ) => React.ReactNode;
}

export interface InlineEditableApiTableProps<T = Record<string, unknown>>
  extends Omit<ApiTableProps<T>, 'columns'> {
  /**
   * Extended columns with inline editing capabilities
   */
  columns: EditableTableColumn<T>[];
  
  /**
   * Endpoint to update individual cells/rows
   */
  updateEndpoint?: (rowId: string | number) => string;
  
  /**
   * Called when a cell is successfully updated
   */
  onCellUpdate?: (rowId: string | number, columnKey: string, newValue: unknown, updatedRow: T) => void;
  
  /**
   * Called when a cell update fails
   */
  onCellUpdateError?: (rowId: string | number, columnKey: string, error: Error) => void;
  
  /**
   * Whether to update the entire row or just the changed field
   * @default "field" - only send the changed field
   */
  updateMode?: "field" | "row";
  
  /**
   * Debounce delay for auto-save (in milliseconds)
   * @default 500
   */
  saveDelay?: number;
}

export interface EditingState {
  rowId: string | number | null;
  columnKey: string | null;
  originalValue: unknown;
  currentValue: string | number;
  isValid: boolean;
  errorMessage: string | null;
}

export interface UseInlineEditingOptions<T = Record<string, unknown>> {
  data: T[] | null;
  columns: EditableTableColumn<T>[];
  updateEndpoint?: (rowId: string | number) => string;
  onCellUpdate?: (rowId: string | number, columnKey: string, newValue: unknown, updatedRow: T) => void;
  onCellUpdateError?: (rowId: string | number, columnKey: string, error: Error) => void;
  updateMode?: "field" | "row";
  saveDelay?: number;
  queryKey?: string[];
}

export interface UseInlineEditingReturn {
  editingState: EditingState | null;
  startEditing: (rowId: string | number, columnKey: string, currentValue: unknown) => void;
  updateValue: (newValue: string | number) => void;
  saveEdit: () => Promise<void>;
  cancelEdit: () => void;
  isEditing: (rowId: string | number, columnKey: string) => boolean;
}
