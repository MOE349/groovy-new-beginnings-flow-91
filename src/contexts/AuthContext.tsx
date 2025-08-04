import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiCall } from '@/utils/apis';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/utils/errorHandling';

interface User {
  tenant_id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiCall<any>('/users/login', {
        method: 'POST',
        body: { email, password },
      });

      console.log('Login response:', response);
      console.log('Login response data:', response.data);
      
      // Handle different possible response structures
      let access, refresh, userEmail, name, tenant_id;
      
      if (response.data?.data) {
        // Structure: { data: { data: { access, refresh, ... } } }
        ({ access, refresh, email: userEmail, name, tenant_id } = response.data.data);
      } else if (response.data?.access) {
        // Structure: { data: { access, refresh, ... } }
        ({ access, refresh, email: userEmail, name, tenant_id } = response.data);
      } else if ((response as any).access) {
        // Structure: { access, refresh, ... }
        ({ access, refresh, email: userEmail, name, tenant_id } = response as any);
      } else {
        console.error('Unexpected login response structure:', response);
        throw new Error('Invalid response structure');
      }

      console.log('Extracted data:', { access, refresh, userEmail, name, tenant_id });
      
      if (!access || !refresh) {
        throw new Error('Missing access or refresh token');
      }

      const userData = { tenant_id, email: userEmail, name };
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: 'Welcome back!',
        description: 'You have been logged in successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      handleApiError(error, 'Login failed');
      return false;
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      const response = await apiCall<{
        data: {
          access: string;
          refresh: string;
          email: string;
          name: string;
          tenant_id: string;
        };
        meta_data: {
          success: boolean;
          total: number;
          status_code: number;
        };
      }>('/users/register', {
        method: 'POST',
        body: { email, password, name },
      });

      const { access, refresh, email: userEmail, name: userName, tenant_id } = response.data.data;
      const userData = { tenant_id, email: userEmail, name: userName };
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: 'Account created!',
        description: 'Your account has been created successfully.',
      });
      
      return true;
    } catch (error) {
      handleApiError(error, 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};