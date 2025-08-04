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
} from './common.types';

export type {
  // Assets
  Asset,
  Equipment,
  Attachment,
  AssetCategory,
  Location,
  Site,
  CreateAssetDto,
  UpdateAssetDto,
} from './asset.types';

export type {
  // Work Orders
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  MaintenanceType,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
} from './workorder.types';

export type {
  // Auth & Users
  User,
  UserRole,
  Permission,
  AuthTokens,
  LoginRequest,
  LoginResponse,
  Tenant,
} from './auth.types';