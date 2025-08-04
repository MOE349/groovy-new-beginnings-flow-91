import { BaseEntity, ISODateString } from './common.types';

// User Role
export interface UserRole extends BaseEntity {
  name: string;
  display_name: string;
  description?: string;
  permissions: string[];
  is_system?: boolean;
}

// User Permission
export interface Permission {
  id: string;
  name: string;
  display_name: string;
  module: string;
  description?: string;
}

// User
export interface User extends BaseEntity {
  email: string;
  name: string;
  tenant_id: string;
  role?: UserRole;
  permissions?: string[];
  is_active: boolean;
  is_verified: boolean;
  phone?: string;
  avatar_url?: string;
  job_title?: string;
  department?: string;
  employee_id?: string;
  timezone?: string;
  language?: string;
  last_login_at?: ISODateString;
  password_changed_at?: ISODateString;
}

// Auth Tokens
export interface AuthTokens {
  access: string;
  refresh: string;
  access_expires_at?: ISODateString;
  refresh_expires_at?: ISODateString;
}

// Login Request/Response
export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

// Register Request/Response
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  company_name?: string;
  phone?: string;
}

export interface RegisterResponse extends AuthTokens {
  user: User;
}

// Password Reset
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

// Change Password
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// Update Profile
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  job_title?: string;
  department?: string;
  timezone?: string;
  language?: string;
}

// Session
export interface Session extends BaseEntity {
  user_id: string;
  token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: ISODateString;
  last_activity_at: ISODateString;
}

// Tenant
export interface Tenant extends BaseEntity {
  name: string;
  subdomain: string;
  is_active: boolean;
  subscription_plan?: string;
  subscription_expires_at?: ISODateString;
  settings?: {
    logo_url?: string;
    primary_color?: string;
    timezone?: string;
    date_format?: string;
    currency?: string;
  };
  limits?: {
    max_users?: number;
    max_assets?: number;
    max_work_orders_per_month?: number;
    max_storage_gb?: number;
  };
}

// Audit Log
export interface AuditLog extends BaseEntity {
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: Record<string, { old: any; new: any }>;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failure';
  error_message?: string;
}

// Two-Factor Authentication
export interface TwoFactorAuth {
  is_enabled: boolean;
  method?: 'totp' | 'sms' | 'email';
  verified_at?: ISODateString;
  backup_codes?: string[];
}

// API Key
export interface ApiKey extends BaseEntity {
  name: string;
  key_preview: string; // First 8 characters of the key
  last_used_at?: ISODateString;
  expires_at?: ISODateString;
  permissions?: string[];
  is_active: boolean;
}