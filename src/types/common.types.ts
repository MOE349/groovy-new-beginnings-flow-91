/**
 * Common types used throughout the application
 */

// API Response types
export interface ApiMetaData {
  success: boolean;
  total: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  status_code: number;
}

export interface ApiResponseWrapper<T> {
  data: T;
  meta_data: ApiMetaData;
}

// Date/Time types
export type ISODateString = string; // ISO 8601 format: "2024-01-01T00:00:00Z"
export type DateString = string; // Format: "2024-01-01"

// Status types
export type OnlineStatus = boolean;

// Common entity properties
export interface TimestampedEntity {
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface IdentifiableEntity {
  id: string;
}

export interface NamedEntity {
  name: string;
}

export interface CodedEntity {
  code: string;
}

// Combine common interfaces
export type BaseEntity = IdentifiableEntity & TimestampedEntity;
export type NamedBaseEntity = BaseEntity & NamedEntity;
export type CodedBaseEntity = BaseEntity & CodedEntity;

// Pagination
export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Search/Filter
export interface SearchParams {
  search?: string;
  [key: string]: any; // Allow for dynamic filter properties
}

// File upload
export interface FileUploadResponse {
  id: string;
  filename: string;
  size: number;
  mime_type: string;
  url: string;
  uploaded_at: ISODateString;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  error?: string;
  errors?: {
    error?: string;
    details?: ValidationError[];
  };
  message?: string;
  status_code: number;
}

// Select option types
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

// Table column configuration
export interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

// Form field configuration
export interface FormFieldBase {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | undefined;
  };
}

// Generic CRUD operations interface
export interface CrudOperations<T, CreateDto, UpdateDto> {
  getAll(params?: SearchParams & PaginationParams): Promise<T[]>;
  getById(id: string): Promise<T>;
  create(data: CreateDto): Promise<T>;
  update(id: string, data: UpdateDto): Promise<T>;
  delete(id: string): Promise<void>;
}