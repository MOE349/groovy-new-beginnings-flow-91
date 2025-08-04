import { 
  BaseEntity, 
  NamedBaseEntity, 
  CodedBaseEntity, 
  OnlineStatus, 
  DateString 
} from './common.types';

// Asset Category
export interface AssetCategory extends NamedBaseEntity {
  slug: string;
  description?: string;
  parent_id?: string;
}

// Weight Class
export interface WeightClass extends NamedBaseEntity {
  min_weight?: number;
  max_weight?: number;
  unit?: 'kg' | 'lbs' | 'tons';
}

// Location
export interface Location extends CodedBaseEntity, NamedBaseEntity {
  site: {
    id: string;
    name: string;
    code: string;
  };
  address?: string;
  latitude?: number;
  longitude?: number;
}

// Site
export interface Site extends CodedBaseEntity, NamedBaseEntity {
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
}

// Base Asset properties
interface BaseAssetProperties {
  description?: string;
  make: string;
  model: string;
  serial_number: string;
  year?: string;
  is_online: OnlineStatus;
  purchase_date?: DateString;
  purchase_price?: number;
  warranty_expiry_date?: DateString;
  notes?: string;
  
  // Relationships
  location: {
    id: string;
    name: string;
    code: string;
  };
  
  // Tracking
  meter_reading?: number;
  meter_unit?: 'hours' | 'miles' | 'km';
  last_service_date?: DateString;
  next_service_date?: DateString;
}

// Equipment specific properties
export interface Equipment extends BaseEntity, NamedBaseEntity, CodedBaseEntity, BaseAssetProperties {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  weight_class?: {
    id: string;
    name: string;
  };
  vin?: string;
  license_plate?: string;
  fuel_type?: 'diesel' | 'gasoline' | 'electric' | 'hybrid' | 'other';
  fuel_capacity?: number;
  payload_capacity?: number;
}

// Attachment specific properties
export interface Attachment extends BaseEntity, NamedBaseEntity, CodedBaseEntity, BaseAssetProperties {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  equipment?: {
    id: string;
    name: string;
    code: string;
  };
  compatibility?: string[];
}

// Combined Asset type
export type Asset = Equipment | Attachment;

// DTOs for creating/updating
export interface CreateEquipmentDto {
  name: string;
  code: string;
  category: string; // category ID
  description?: string;
  make: string;
  model: string;
  serial_number: string;
  year?: string;
  is_online: boolean;
  location: string; // location ID
  weight_class?: string; // weight class ID
  purchase_date?: DateString;
  purchase_price?: number;
  warranty_expiry_date?: DateString;
  vin?: string;
  license_plate?: string;
  fuel_type?: 'diesel' | 'gasoline' | 'electric' | 'hybrid' | 'other';
  fuel_capacity?: number;
  payload_capacity?: number;
  notes?: string;
}

export interface CreateAttachmentDto {
  name: string;
  code: string;
  category: string; // category ID
  equipment?: string; // equipment ID
  description?: string;
  make: string;
  model: string;
  serial_number: string;
  year?: string;
  is_online: boolean;
  location: string; // location ID
  purchase_date?: DateString;
  purchase_price?: number;
  warranty_expiry_date?: DateString;
  compatibility?: string[];
  notes?: string;
}

export type CreateAssetDto = CreateEquipmentDto | CreateAttachmentDto;
export type UpdateAssetDto = Partial<CreateAssetDto>;

// Asset filters
export interface AssetFilters {
  is_online?: boolean;
  category?: string;
  location?: string;
  site?: string;
  equipment?: string; // for attachments
  search?: string;
  date_from?: DateString;
  date_to?: DateString;
  has_warranty?: boolean;
  needs_service?: boolean;
}

// Asset statistics
export interface AssetStatistics {
  total: number;
  online: number;
  offline: number;
  in_maintenance: number;
  by_category: Record<string, number>;
  by_location: Record<string, number>;
  utilization_rate: number;
  average_age_years: number;
}

// Asset history entry
export interface AssetHistoryEntry extends BaseEntity {
  asset_id: string;
  action: 'created' | 'updated' | 'status_changed' | 'location_changed' | 'maintenance' | 'other';
  field?: string;
  old_value?: any;
  new_value?: any;
  description?: string;
  user: {
    id: string;
    name: string;
  };
}

// Asset document
export interface AssetDocument extends BaseEntity {
  asset_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  url: string;
  category?: 'manual' | 'warranty' | 'service_record' | 'invoice' | 'other';
  description?: string;
  uploaded_by: {
    id: string;
    name: string;
  };
}