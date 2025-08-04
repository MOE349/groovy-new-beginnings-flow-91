import { apiClient } from './api.base';
import { API_CONFIG } from '@/config/api';
import { mockApiClient } from './api.mock';
import type { Location, Site } from '@/types/asset.types';
import type { PaginatedResponse } from './api.base';

interface CreateSiteDto {
  code: string;
  name: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
}

interface CreateLocationDto {
  site: string; // site ID
  code: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface CompanySettings {
  id: string;
  company_name: string;
  company_logo?: string;
  primary_contact_email: string;
  primary_contact_phone?: string;
  address?: string;
  time_zone: string;
  currency: string;
  date_format: string;
  business_hours?: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };
  maintenance_settings?: {
    default_pm_interval_days?: number;
    require_work_order_approval?: boolean;
    auto_generate_wo_code?: boolean;
    wo_code_prefix?: string;
  };
  created_at: string;
  updated_at: string;
}

class CompanyService {
  private get client() {
    return API_CONFIG.ENABLE_MOCK_DATA ? mockApiClient : apiClient;
  }

  // ========== Sites ==========

  /**
   * Get all sites
   */
  async getSites(activeOnly?: boolean): Promise<Site[]> {
    const response = await this.client.get<Site[]>('/company/sites', {
      params: { active_only: activeOnly },
    });
    return response.data;
  }

  /**
   * Get paginated sites
   */
  async getSitesPaginated(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Site>> {
    const response = await this.client.get<PaginatedResponse<Site>>('/company/sites', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  }

  /**
   * Get single site by ID
   */
  async getSiteById(id: string): Promise<Site> {
    const response = await this.client.get<Site>(`/company/sites/${id}`);
    return response.data;
  }

  /**
   * Create new site
   */
  async createSite(data: CreateSiteDto): Promise<Site> {
    const response = await this.client.post<Site>('/company/sites', data);
    return response.data;
  }

  /**
   * Update site
   */
  async updateSite(id: string, data: Partial<CreateSiteDto>): Promise<Site> {
    const response = await this.client.patch<Site>(`/company/sites/${id}`, data);
    return response.data;
  }

  /**
   * Delete site
   */
  async deleteSite(id: string): Promise<void> {
    await this.client.delete(`/company/sites/${id}`);
  }

  /**
   * Activate/Deactivate site
   */
  async setSiteStatus(id: string, isActive: boolean): Promise<Site> {
    const response = await this.client.patch<Site>(`/company/sites/${id}`, { is_active: isActive });
    return response.data;
  }

  // ========== Locations ==========

  /**
   * Get all locations
   */
  async getLocations(siteId?: string): Promise<Location[]> {
    const response = await this.client.get<Location[]>('/company/location', {
      params: { site_id: siteId },
    });
    return response.data;
  }

  /**
   * Get paginated locations
   */
  async getLocationsPaginated(page: number = 1, pageSize: number = 20, siteId?: string): Promise<PaginatedResponse<Location>> {
    const response = await this.client.get<PaginatedResponse<Location>>('/company/location', {
      params: { page, page_size: pageSize, site_id: siteId },
    });
    return response.data;
  }

  /**
   * Get single location by ID
   */
  async getLocationById(id: string): Promise<Location> {
    const response = await this.client.get<Location>(`/company/location/${id}`);
    return response.data;
  }

  /**
   * Get locations by site
   */
  async getLocationsBySite(siteId: string): Promise<Location[]> {
    const response = await this.client.get<Location[]>(`/company/sites/${siteId}/locations`);
    return response.data;
  }

  /**
   * Create new location
   */
  async createLocation(data: CreateLocationDto): Promise<Location> {
    const response = await this.client.post<Location>('/company/location', data);
    return response.data;
  }

  /**
   * Update location
   */
  async updateLocation(id: string, data: Partial<CreateLocationDto>): Promise<Location> {
    const response = await this.client.patch<Location>(`/company/location/${id}`, data);
    return response.data;
  }

  /**
   * Delete location
   */
  async deleteLocation(id: string): Promise<void> {
    await this.client.delete(`/company/location/${id}`);
  }

  /**
   * Update location coordinates
   */
  async updateLocationCoordinates(id: string, latitude: number, longitude: number): Promise<Location> {
    const response = await this.client.patch<Location>(`/company/location/${id}/coordinates`, {
      latitude,
      longitude,
    });
    return response.data;
  }

  // ========== Company Settings ==========

  /**
   * Get company settings
   */
  async getCompanySettings(): Promise<CompanySettings> {
    const response = await this.client.get<CompanySettings>('/company/settings');
    return response.data;
  }

  /**
   * Update company settings
   */
  async updateCompanySettings(data: Partial<CompanySettings>): Promise<CompanySettings> {
    const response = await this.client.patch<CompanySettings>('/company/settings', data);
    return response.data;
  }

  /**
   * Upload company logo
   */
  async uploadCompanyLogo(file: File): Promise<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await this.client.post<{ logo_url: string }>('/company/settings/logo', formData, {
      customHeaders: {
        'Content-Type': undefined as any,
      },
    });
    return response.data;
  }

  /**
   * Update business hours
   */
  async updateBusinessHours(businessHours: CompanySettings['business_hours']): Promise<CompanySettings> {
    const response = await this.client.patch<CompanySettings>('/company/settings/business-hours', {
      business_hours: businessHours,
    });
    return response.data;
  }

  /**
   * Update maintenance settings
   */
  async updateMaintenanceSettings(maintenanceSettings: CompanySettings['maintenance_settings']): Promise<CompanySettings> {
    const response = await this.client.patch<CompanySettings>('/company/settings/maintenance', {
      maintenance_settings: maintenanceSettings,
    });
    return response.data;
  }

  // ========== Departments ==========

  /**
   * Get departments
   */
  async getDepartments(): Promise<Array<{ id: string; name: string; description?: string }>> {
    const response = await this.client.get<Array<{ id: string; name: string; description?: string }>>('/company/departments');
    return response.data;
  }

  /**
   * Create department
   */
  async createDepartment(data: { name: string; description?: string }): Promise<{ id: string; name: string; description?: string }> {
    const response = await this.client.post('/company/departments', data);
    return response.data;
  }

  /**
   * Update department
   */
  async updateDepartment(id: string, data: { name: string; description?: string }): Promise<{ id: string; name: string; description?: string }> {
    const response = await this.client.patch(`/company/departments/${id}`, data);
    return response.data;
  }

  /**
   * Delete department
   */
  async deleteDepartment(id: string): Promise<void> {
    await this.client.delete(`/company/departments/${id}`);
  }

  // ========== Teams ==========

  /**
   * Get teams
   */
  async getTeams(): Promise<Array<{ id: string; name: string; description?: string; member_count: number }>> {
    const response = await this.client.get<Array<{ id: string; name: string; description?: string; member_count: number }>>('/company/teams');
    return response.data;
  }

  /**
   * Create team
   */
  async createTeam(data: { name: string; description?: string; member_ids?: string[] }): Promise<{ id: string; name: string; description?: string }> {
    const response = await this.client.post('/company/teams', data);
    return response.data;
  }

  /**
   * Update team
   */
  async updateTeam(id: string, data: { name?: string; description?: string }): Promise<{ id: string; name: string; description?: string }> {
    const response = await this.client.patch(`/company/teams/${id}`, data);
    return response.data;
  }

  /**
   * Delete team
   */
  async deleteTeam(id: string): Promise<void> {
    await this.client.delete(`/company/teams/${id}`);
  }

  /**
   * Add team members
   */
  async addTeamMembers(teamId: string, userIds: string[]): Promise<void> {
    await this.client.post(`/company/teams/${teamId}/members`, { user_ids: userIds });
  }

  /**
   * Remove team member
   */
  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await this.client.delete(`/company/teams/${teamId}/members/${userId}`);
  }

  // ========== Export/Import ==========

  /**
   * Export company data
   */
  async exportCompanyData(dataTypes: string[]): Promise<Blob> {
    const response = await this.client.post<Blob>('/company/export', {
      data_types: dataTypes,
    }, {
      customHeaders: {
        'Accept': 'application/zip',
      },
    });
    return response.data;
  }

  /**
   * Import company data
   */
  async importCompanyData(file: File): Promise<{ success: boolean; imported: Record<string, number>; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/company/import', formData, {
      customHeaders: {
        'Content-Type': undefined as any,
      },
    });
    return response.data;
  }
}

export const companyService = new CompanyService();