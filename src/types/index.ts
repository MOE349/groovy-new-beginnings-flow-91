// Export all type definitions from a central location

// Common types
export * from './common.types';

// Domain-specific types
export * from './asset.types';
export * from './workorder.types';
export * from './auth.types';

// Re-export commonly used types for convenience
export type {
  // Common
  ApiResponseWrapper,
  ApiMetaData,
  ISODateString,
  DateString,
  BaseEntity,
  SelectOption,
  TableColumn,
  
  // Assets
  Asset,
  Equipment,
  Attachment,
  AssetCategory,
  Location,
  Site,
  CreateAssetDto,
  UpdateAssetDto,
  
  // Work Orders
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  MaintenanceType,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  
  // Auth & Users
  User,
  UserRole,
  Permission,
  AuthTokens,
  LoginRequest,
  LoginResponse,
  Tenant,
} from './index';