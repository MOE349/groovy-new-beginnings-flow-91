import { apiClient } from './api.base';
import { API_CONFIG } from '@/config/api';
import { mockApiClient } from './api.mock';
import type { User } from '@/types/auth.types';

interface LoginDto {
  email: string;
  password: string;
  remember_me?: boolean;
}

interface RegisterDto {
  email: string;
  password: string;
  name: string;
  company_name?: string;
  phone?: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  expires_in: number;
}

interface RefreshTokenResponse {
  access: string;
  refresh?: string;
  expires_in: number;
}

interface VerifyEmailDto {
  token: string;
}

interface TwoFactorAuthDto {
  code: string;
  backup_code?: string;
}

class AuthService {
  private get client() {
    // Auth endpoints should always use real API client even in mock mode
    // except for specific development scenarios
    return API_CONFIG.ENABLE_MOCK_DATA && process.env.NODE_ENV === 'development' 
      ? mockApiClient 
      : apiClient;
  }

  /**
   * User login
   */
  async login(data: LoginDto): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/users/login', data, {
      skipAuth: true,
    });
    
    // Store tokens and user data
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * User registration
   */
  async register(data: RegisterDto): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/users/register', data, {
      skipAuth: true,
    });
    
    // Store tokens and user data
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken?: string): Promise<RefreshTokenResponse> {
    const token = refreshToken || localStorage.getItem('refresh_token');
    
    if (!token) {
      throw new Error('No refresh token available');
    }
    
    const response = await this.client.post<RefreshTokenResponse>('/auth/refresh', {
      refresh: token,
    }, {
      skipAuth: true,
    });
    
    // Update stored tokens
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }
    }
    
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Try to invalidate token on server
    if (refreshToken) {
      try {
        await this.client.post('/auth/logout', {
          refresh: refreshToken,
        });
      } catch (error) {
        // Continue with local logout even if server logout fails
        console.warn('Server logout failed:', error);
      }
    }
    
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  /**
   * Verify email address
   */
  async verifyEmail(data: VerifyEmailDto): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{ success: boolean; message: string }>('/auth/verify-email', data, {
      skipAuth: true,
    });
    return response.data;
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{ success: boolean; message: string }>('/auth/resend-verification', {
      email,
    });
    return response.data;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{ success: boolean; message: string }>('/auth/forgot-password', {
      email,
    }, {
      skipAuth: true,
    });
    return response.data;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{ success: boolean; message: string }>('/auth/reset-password', {
      token,
      new_password: newPassword,
    }, {
      skipAuth: true,
    });
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Get current user from storage (without API call)
   */
  getStoredUser(): User | null {
    const userData = localStorage.getItem('user_data');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }

  /**
   * Get current user from storage (alias for getStoredUser)
   */
  getCurrentUser(): User | null {
    return this.getStoredUser();
  }

  /**
   * Check token validity
   */
  async checkTokenValidity(): Promise<boolean> {
    try {
      await this.client.get('/auth/check', {
        timeout: 5000,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // ========== Two-Factor Authentication ==========

  /**
   * Enable 2FA
   */
  async enable2FA(): Promise<{ 
    secret: string; 
    qr_code: string; 
    backup_codes: string[] 
  }> {
    const response = await this.client.post('/auth/2fa/enable');
    return response.data;
  }

  /**
   * Confirm 2FA setup
   */
  async confirm2FA(code: string): Promise<{ success: boolean; backup_codes: string[] }> {
    const response = await this.client.post('/auth/2fa/confirm', { code });
    return response.data;
  }

  /**
   * Disable 2FA
   */
  async disable2FA(password: string): Promise<{ success: boolean }> {
    const response = await this.client.post('/auth/2fa/disable', { password });
    return response.data;
  }

  /**
   * Verify 2FA code during login
   */
  async verify2FA(data: TwoFactorAuthDto): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/2fa/verify', data, {
      skipAuth: true,
    });
    
    // Store tokens and user data
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(): Promise<{ backup_codes: string[] }> {
    const response = await this.client.post('/auth/2fa/backup-codes');
    return response.data;
  }

  // ========== OAuth ==========

  /**
   * Get OAuth login URL
   */
  getOAuthLoginUrl(provider: 'google' | 'microsoft' | 'github'): string {
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    return `${API_CONFIG.BASE_URL}/auth/oauth/${provider}?redirect_uri=${redirectUri}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(provider: string, code: string): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/oauth/callback', {
      provider,
      code,
      redirect_uri: window.location.origin + '/auth/callback',
    }, {
      skipAuth: true,
    });
    
    // Store tokens and user data
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  // ========== Session Management ==========

  /**
   * Get active sessions
   */
  async getActiveSessions(): Promise<Array<{
    id: string;
    device: string;
    ip_address: string;
    location?: string;
    last_active: string;
    is_current: boolean;
  }>> {
    const response = await this.client.get('/auth/sessions');
    return response.data;
  }

  /**
   * Terminate session
   */
  async terminateSession(sessionId: string): Promise<void> {
    await this.client.delete(`/auth/sessions/${sessionId}`);
  }

  /**
   * Terminate all other sessions
   */
  async terminateAllOtherSessions(): Promise<void> {
    await this.client.post('/auth/sessions/terminate-others');
  }
}

export const authService = new AuthService();