import { 
  BaseEntity, 
  CodedBaseEntity, 
  DateString, 
  ISODateString 
} from './common.types';

// Work Order Status
export interface WorkOrderStatus extends BaseEntity {
  name: string;
  color?: string;
  order?: number;
  is_closed?: boolean;
}

// Work Order Priority
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical';

// Maintenance Type
export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'emergency' | 'inspection';

// Work Order
export interface WorkOrder extends BaseEntity, CodedBaseEntity {
  // Basic Information
  title?: string;
  description?: string;
  maint_type?: MaintenanceType;
  priority?: WorkOrderPriority;
  
  // Status
  status: {
    id: string;
    name: string;
    color?: string;
  };
  
  // Asset Information
  asset: {
    id: string;
    name: string;
    code: string;
    location?: {
      id: string;
      name: string;
      code: string;
    };
  };
  
  // Scheduling
  suggested_start_date?: DateString;
  suggested_completion_date?: DateString;
  actual_start_date?: DateString;
  completion_end_date?: DateString;
  estimated_hours?: number;
  actual_hours?: number;
  
  // Meter Reading
  start_meter_reading?: number;
  completion_meter_reading?: number;
  
  // Assignment
  assigned_to?: {
    id: string;
    name: string;
    email: string;
  };
  assigned_team?: {
    id: string;
    name: string;
  };
  
  // Creation/Completion
  created_by: {
    id: string;
    name: string;
  };
  completed_by?: {
    id: string;
    name: string;
  };
  
  // Related Data
  parent_work_order_id?: string;
  child_work_orders?: string[];
  related_work_orders?: string[];
  
  // Costs
  estimated_cost?: number;
  actual_cost?: number;
  labor_cost?: number;
  parts_cost?: number;
  
  // Additional fields
  failure_code?: string;
  cause_code?: string;
  remedy_code?: string;
  downtime_hours?: number;
}

// Work Order DTOs
export interface CreateWorkOrderDto {
  asset: string; // asset ID
  status: string; // status ID
  title?: string;
  description?: string;
  maint_type?: MaintenanceType;
  priority?: WorkOrderPriority;
  suggested_start_date?: DateString;
  suggested_completion_date?: DateString;
  estimated_hours?: number;
  estimated_cost?: number;
  assigned_to?: string; // user ID
  assigned_team?: string; // team ID
  parent_work_order_id?: string;
}

export interface UpdateWorkOrderDto extends Partial<CreateWorkOrderDto> {
  actual_start_date?: DateString;
  completion_end_date?: DateString;
  actual_hours?: number;
  actual_cost?: number;
  labor_cost?: number;
  parts_cost?: number;
  start_meter_reading?: number;
  completion_meter_reading?: number;
  failure_code?: string;
  cause_code?: string;
  remedy_code?: string;
  downtime_hours?: number;
}

// Work Order Task/Checklist Item
export interface WorkOrderTask extends BaseEntity {
  work_order_id: string;
  description: string;
  is_completed: boolean;
  completed_by?: {
    id: string;
    name: string;
  };
  completed_at?: ISODateString;
  notes?: string;
  order?: number;
}

// Work Order Comment
export interface WorkOrderComment extends BaseEntity {
  work_order_id: string;
  comment: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  is_internal?: boolean;
  mentioned_users?: string[];
}

// Work Order Attachment
export interface WorkOrderAttachment extends BaseEntity {
  work_order_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  url: string;
  description?: string;
  uploaded_by: {
    id: string;
    name: string;
  };
}

// Work Order Part
export interface WorkOrderPart extends BaseEntity {
  work_order_id: string;
  part: {
    id: string;
    name: string;
    part_number: string;
    unit_cost: number;
  };
  quantity_used: number;
  total_cost: number;
  notes?: string;
}

// Work Order Labor
export interface WorkOrderLabor extends BaseEntity {
  work_order_id: string;
  technician: {
    id: string;
    name: string;
    hourly_rate: number;
  };
  hours_worked: number;
  work_date: DateString;
  total_cost: number;
  description?: string;
}

// Work Order Filters
export interface WorkOrderFilters {
  status?: string | string[];
  asset?: string;
  location?: string;
  priority?: WorkOrderPriority | WorkOrderPriority[];
  maint_type?: MaintenanceType | MaintenanceType[];
  assigned_to?: string;
  assigned_team?: string;
  created_by?: string;
  date_from?: DateString;
  date_to?: DateString;
  is_overdue?: boolean;
  has_downtime?: boolean;
  search?: string;
}

// Work Order Statistics
export interface WorkOrderStatistics {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
  overdue: number;
  completed_on_time_rate: number;
  average_completion_time_hours: number;
  total_cost: number;
  by_priority: Record<WorkOrderPriority, number>;
  by_type: Record<MaintenanceType, number>;
  by_status: Record<string, number>;
}

// Work Order Template (for recurring/PM work orders)
export interface WorkOrderTemplate extends BaseEntity {
  name: string;
  description?: string;
  maint_type: MaintenanceType;
  priority: WorkOrderPriority;
  estimated_hours?: number;
  estimated_cost?: number;
  tasks: Array<{
    description: string;
    order: number;
  }>;
  parts: Array<{
    part_id: string;
    quantity: number;
  }>;
  trigger_type: 'time' | 'meter' | 'event';
  trigger_value?: number;
  trigger_unit?: string;
  is_active: boolean;
}