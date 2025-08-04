import { apiClient } from './api.base';
import { API_CONFIG } from '@/config/api';
import { mockApiClient } from './api.mock';
import type { User, UserRole, Permission } from '@/types/auth.types';
import type { PaginatedResponse } from './api.base';

interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role_id?: string;
  department_id?: string;
  team_ids?: string[];
  phone?: string;
  is_active?: boolean;
}

interface UpdateUserDto {
  email?: string;
  name?: string;
  role_id?: string;
  department_id?: string;
  team_ids?: string[];
  phone?: string;
  is_active?: boolean;
}

interface UserFilters {
  search?: string;
  role_id?: string;
  department_id?: string;
  team_id?: string;
  is_active?: boolean;
  created_from?: string;
  created_to?: string;
}

interface ChangePasswordDto {
  current_password?: string;
  new_password: string;
}

interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

class UserService {
  private get client() {
    return API_CONFIG.ENABLE_MOCK_DATA ? mockApiClient : apiClient;
  }

  // ========== Users ==========

  /**
   * Get all users
   */
  async getUsers(filters?: UserFilters): Promise<User[]> {
    const response = await this.client.get<User[]>('/users/users', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get paginated users
   */
  async getUsersPaginated(page: number = 1, pageSize: number = 20, filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const response = await this.client.get<PaginatedResponse<User>>('/users/users', {
      params: { page, page_size: pageSize, ...filters },
    });
    return response.data;
  }

  /**
   * Get single user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await this.client.get<User>(`/users/users/${id}`);
    return response.data;
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/users/me');
    return response.data;
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserDto): Promise<User> {
    const response = await this.client.post<User>('/users/users', data);
    return response.data;
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await this.client.patch<User>(`/users/users/${id}`, data);
    return response.data;
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: { name?: string; phone?: string; avatar?: File }): Promise<User> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.phone) formData.append('phone', data.phone);
    if (data.avatar) formData.append('avatar', data.avatar);

    const response = await this.client.patch<User>('/users/me', formData, {
      customHeaders: {
        'Content-Type': undefined as any,
      },
    });
    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await this.client.delete(`/users/users/${id}`);
  }

  /**
   * Activate/Deactivate user
   */
  async setUserStatus(id: string, isActive: boolean): Promise<User> {
    const response = await this.client.patch<User>(`/users/users/${id}/status`, { is_active: isActive });
    return response.data;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
    await this.client.post(`/users/users/${userId}/change-password`, data);
  }

  /**
   * Change current user password
   */
  async changeMyPassword(data: ChangePasswordDto): Promise<void> {
    await this.client.post('/users/me/change-password', data);
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId: string): Promise<{ temporary_password: string }> {
    const response = await this.client.post<{ temporary_password: string }>(`/users/users/${userId}/reset-password`);
    return response.data;
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    await this.client.post('/users/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
    await this.client.post('/users/reset-password', {
      token,
      new_password: newPassword,
    });
  }

  // ========== Roles ==========

  /**
   * Get all roles
   */
  async getRoles(): Promise<UserRole[]> {
    const response = await this.client.get<UserRole[]>('/users/roles');
    return response.data;
  }

  /**
   * Get single role by ID
   */
  async getRoleById(id: string): Promise<UserRole> {
    const response = await this.client.get<UserRole>(`/users/roles/${id}`);
    return response.data;
  }

  /**
   * Create new role
   */
  async createRole(data: { name: string; description?: string; permissions: string[] }): Promise<UserRole> {
    const response = await this.client.post<UserRole>('/users/roles', data);
    return response.data;
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }): Promise<UserRole> {
    const response = await this.client.patch<UserRole>(`/users/roles/${id}`, data);
    return response.data;
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    await this.client.delete(`/users/roles/${id}`);
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<User> {
    const response = await this.client.post<User>(`/users/users/${userId}/assign-role`, { role_id: roleId });
    return response.data;
  }

  // ========== Permissions ==========

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    const response = await this.client.get<Permission[]>('/users/permissions');
    return response.data;
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const response = await this.client.get<string[]>(`/users/users/${userId}/permissions`);
    return response.data;
  }

  /**
   * Get current user permissions
   */
  async getMyPermissions(): Promise<string[]> {
    const response = await this.client.get<string[]>('/users/me/permissions');
    return response.data;
  }

  // ========== User Activity ==========

  /**
   * Get user activity log
   */
  async getUserActivity(userId: string, limit: number = 50): Promise<UserActivity[]> {
    const response = await this.client.get<UserActivity[]>(`/users/users/${userId}/activity`, {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Get current user activity
   */
  async getMyActivity(limit: number = 50): Promise<UserActivity[]> {
    const response = await this.client.get<UserActivity[]>('/users/me/activity', {
      params: { limit },
    });
    return response.data;
  }

  // ========== Sessions ==========

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<Array<{
    id: string;
    ip_address: string;
    user_agent: string;
    last_activity: string;
    is_current: boolean;
  }>> {
    const response = await this.client.get(`/users/users/${userId}/sessions`);
    return response.data;
  }

  /**
   * Get current user sessions
   */
  async getMySessions(): Promise<Array<{
    id: string;
    ip_address: string;
    user_agent: string;
    last_activity: string;
    is_current: boolean;
  }>> {
    const response = await this.client.get('/users/me/sessions');
    return response.data;
  }

  /**
   * Revoke user session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.client.delete(`/users/sessions/${sessionId}`);
  }

  /**
   * Revoke all user sessions
   */
  async revokeAllSessions(userId: string): Promise<void> {
    await this.client.post(`/users/users/${userId}/revoke-all-sessions`);
  }

  // ========== Bulk Operations ==========

  /**
   * Bulk create users
   */
  async bulkCreateUsers(users: CreateUserDto[]): Promise<{ success: number; failed: number; errors: any[] }> {
    const response = await this.client.post('/users/users/bulk', { users });
    return response.data;
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(userIds: string[], updates: Partial<UpdateUserDto>): Promise<User[]> {
    const response = await this.client.patch<User[]>('/users/users/bulk', {
      user_ids: userIds,
      updates,
    });
    return response.data;
  }

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(userIds: string[]): Promise<void> {
    await this.client.post('/users/users/bulk-delete', { user_ids: userIds });
  }

  // ========== Export/Import ==========

  /**
   * Export users to CSV
   */
  async exportUsers(filters?: UserFilters): Promise<Blob> {
    const response = await this.client.get<Blob>('/users/users/export', {
      params: filters,
      customHeaders: {
        'Accept': 'text/csv',
      },
    });
    return response.data;
  }

  /**
   * Import users from CSV
   */
  async importUsers(file: File): Promise<{ success: number; failed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/users/users/import', formData, {
      customHeaders: {
        'Content-Type': undefined as any,
      },
    });
    return response.data;
  }
}

export const userService = new UserService();