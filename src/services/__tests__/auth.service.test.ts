import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/services/api.base';

// Mock the apiClient
vi.mock('@/services/api.base', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('login', () => {
    it('successfully logs in and returns auth data', async () => {
      const mockAuthResponse = {
        data: {
          data: {
            access: 'mock-access-token',
            refresh: 'mock-refresh-token',
            email: 'test@example.com',
            name: 'Test User',
            tenant_id: 'tenant-123',
          },
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockAuthResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/users/login',
        {
          email: 'test@example.com',
          password: 'password123',
        },
        { skipAuth: true }
      );

      expect(result).toEqual({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        email: 'test@example.com',
        name: 'Test User',
        tenant_id: 'tenant-123',
      });
    });

    it('handles different response structures', async () => {
      const mockAuthResponse = {
        data: {
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
          email: 'test@example.com',
          name: 'Test User',
          tenant_id: 'tenant-123',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockAuthResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockAuthResponse.data);
    });
  });

  describe('register', () => {
    it('successfully registers a new user', async () => {
      const mockRegisterResponse = {
        data: {
          data: {
            access: 'mock-access-token',
            refresh: 'mock-refresh-token',
            email: 'newuser@example.com',
            name: 'New User',
            tenant_id: 'tenant-456',
          },
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockRegisterResponse);

      const result = await authService.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/users/register',
        {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        },
        { skipAuth: true }
      );

      expect(result).toEqual(mockRegisterResponse.data.data);
    });
  });

  describe('logout', () => {
    it('clears all auth data from localStorage', () => {
      // Set up some data in localStorage
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh');
      localStorage.setItem('user_data', '{"name":"Test"}');

      authService.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when access token exists', () => {
      localStorage.setItem('access_token', 'token');
      
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('returns false when access token does not exist', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getStoredUser', () => {
    it('returns parsed user data when valid', () => {
      const userData = {
        tenant_id: 'tenant-123',
        email: 'test@example.com',
        name: 'Test User',
      };
      
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      expect(authService.getStoredUser()).toEqual(userData);
    });

    it('returns null when no user data exists', () => {
      expect(authService.getStoredUser()).toBeNull();
    });

    it('returns null when user data is invalid JSON', () => {
      localStorage.setItem('user_data', 'invalid-json');
      
      expect(authService.getStoredUser()).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('successfully changes password', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} });

      await authService.changePassword('oldpass', 'newpass');

      expect(apiClient.post).toHaveBeenCalledWith('/users/change-password', {
        old_password: 'oldpass',
        new_password: 'newpass',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('fetches and returns current user', async () => {
      const mockUser = {
        data: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          tenant_id: 'tenant-123',
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockUser.data);
    });
  });
});