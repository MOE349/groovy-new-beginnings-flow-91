import React from 'react';
import { create } from 'zustand';
import { Permission, UserRole } from '@/types/auth.types';

interface PermissionsState {
  userRole: UserRole | null;
  permissions: string[];
  isLoading: boolean;
  
  // Permission checks
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccess: (resource: string, action: string) => boolean;
  
  // Actions
  setUserRole: (role: UserRole | null) => void;
  setPermissions: (permissions: string[]) => void;
  clearPermissions: () => void;
  setLoading: (loading: boolean) => void;
}

// Common permission constants
export const PERMISSIONS = {
  // Assets
  ASSETS_VIEW: 'assets.view',
  ASSETS_CREATE: 'assets.create',
  ASSETS_EDIT: 'assets.edit',
  ASSETS_DELETE: 'assets.delete',
  
  // Work Orders
  WORK_ORDERS_VIEW: 'work_orders.view',
  WORK_ORDERS_CREATE: 'work_orders.create',
  WORK_ORDERS_EDIT: 'work_orders.edit',
  WORK_ORDERS_DELETE: 'work_orders.delete',
  WORK_ORDERS_ASSIGN: 'work_orders.assign',
  WORK_ORDERS_COMPLETE: 'work_orders.complete',
  
  // Parts
  PARTS_VIEW: 'parts.view',
  PARTS_CREATE: 'parts.create',
  PARTS_EDIT: 'parts.edit',
  PARTS_DELETE: 'parts.delete',
  
  // Purchase Orders
  PURCHASE_ORDERS_VIEW: 'purchase_orders.view',
  PURCHASE_ORDERS_CREATE: 'purchase_orders.create',
  PURCHASE_ORDERS_EDIT: 'purchase_orders.edit',
  PURCHASE_ORDERS_DELETE: 'purchase_orders.delete',
  PURCHASE_ORDERS_APPROVE: 'purchase_orders.approve',
  
  // Billing
  BILLING_VIEW: 'billing.view',
  BILLING_CREATE: 'billing.create',
  BILLING_EDIT: 'billing.edit',
  BILLING_EXPORT: 'billing.export',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  
  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE_ROLES: 'users.manage_roles',
  
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_MANAGE_COMPANY: 'settings.manage_company',
  
  // System
  SYSTEM_ADMIN: 'system.admin',
} as const;

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  userRole: null,
  permissions: [],
  isLoading: false,
  
  hasPermission: (permission: string) => {
    const state = get();
    // System admin has all permissions
    if (state.permissions.includes(PERMISSIONS.SYSTEM_ADMIN)) {
      return true;
    }
    return state.permissions.includes(permission);
  },
  
  hasAnyPermission: (permissions: string[]) => {
    const state = get();
    // System admin has all permissions
    if (state.permissions.includes(PERMISSIONS.SYSTEM_ADMIN)) {
      return true;
    }
    return permissions.some(permission => state.permissions.includes(permission));
  },
  
  hasAllPermissions: (permissions: string[]) => {
    const state = get();
    // System admin has all permissions
    if (state.permissions.includes(PERMISSIONS.SYSTEM_ADMIN)) {
      return true;
    }
    return permissions.every(permission => state.permissions.includes(permission));
  },
  
  canAccess: (resource: string, action: string) => {
    const permission = `${resource}.${action}`;
    return get().hasPermission(permission);
  },
  
  setUserRole: (role) => set({ userRole: role }),
  
  setPermissions: (permissions) => set({ permissions }),
  
  clearPermissions: () => set({ userRole: null, permissions: [] }),
  
  setLoading: (loading) => set({ isLoading: loading }),
}));

// Helper hook for permission checks in components
export const usePermission = (permission: string | string[]) => {
  const { hasPermission, hasAnyPermission } = usePermissionsStore();
  
  if (Array.isArray(permission)) {
    return hasAnyPermission(permission);
  }
  
  return hasPermission(permission);
};

// Helper component for conditional rendering based on permissions
interface CanProps {
  permission: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ permission, fallback = null, children }) => {
  const hasAccess = usePermission(permission);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};