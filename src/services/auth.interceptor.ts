import { authService } from './auth.service';

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

class AuthInterceptor {
  private refreshInProgress = false;
  private refreshQueue: QueuedRequest[] = [];
  private tokenExpiryTimeout?: NodeJS.Timeout;

  /**
   * Initialize auth interceptor
   */
  initialize() {
    // Check token expiry on startup
    this.scheduleTokenRefresh();
    
    // Check token expiry when window regains focus
    window.addEventListener('focus', () => {
      this.checkTokenExpiry();
    });
  }

  /**
   * Check if token needs refresh
   */
  private needsRefresh(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      // Decode JWT token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

      // Refresh if token expires in less than 5 minutes
      return expiryTime - currentTime < bufferTime;
    } catch {
      return false;
    }
  }

  /**
   * Get token expiry time
   */
  private getTokenExpiry(): number | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  }

  /**
   * Check token expiry and refresh if needed
   */
  async checkTokenExpiry() {
    if (this.needsRefresh() && !this.refreshInProgress) {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Proactive token refresh failed:', error);
      }
    }
  }

  /**
   * Schedule next token refresh
   */
  private scheduleTokenRefresh() {
    // Clear existing timeout
    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout);
    }

    const expiry = this.getTokenExpiry();
    if (!expiry) return;

    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    const refreshTime = expiry - currentTime - bufferTime;

    if (refreshTime > 0) {
      this.tokenExpiryTimeout = setTimeout(() => {
        this.checkTokenExpiry();
      }, refreshTime);
    }
  }

  /**
   * Handle 401 response
   */
  async handle401(): Promise<string> {
    // If refresh is already in progress, queue this request
    if (this.refreshInProgress) {
      return new Promise<string>((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    // Start refresh process
    this.refreshInProgress = true;

    try {
      const response = await authService.refreshToken();
      const newToken = response.access;

      // Schedule next refresh
      this.scheduleTokenRefresh();

      // Resolve all queued requests
      this.refreshQueue.forEach(({ resolve }) => resolve(newToken));
      this.refreshQueue = [];

      return newToken;
    } catch (error) {
      // Reject all queued requests
      this.refreshQueue.forEach(({ reject }) => reject(error));
      this.refreshQueue = [];

      // Clear auth data and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login');
      }
      
      throw error;
    } finally {
      this.refreshInProgress = false;
    }
  }

  /**
   * Refresh token with retry logic
   */
  async refreshToken(retries = 3): Promise<any> {
    let lastError: any;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await authService.refreshToken();
        return response;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on specific errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw error;
        }

        // Exponential backoff
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    throw lastError;
  }

  /**
   * Add auth header to request
   */
  getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Check if request should skip auth
   */
  shouldSkipAuth(url: string): boolean {
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
    ];

    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Clear auth data
   */
  clearAuth() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    
    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout);
    }
  }
}

export const authInterceptor = new AuthInterceptor();