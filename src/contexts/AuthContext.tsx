import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiCall } from '@/utils/apis';
import { useToast } from '@/hooks/use-toast';

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
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await apiCall<{
            data: {
              email: string;
              name: string;
              tenant_id: string;
            };
          }>('/auth/me');
          const { email, name, tenant_id } = response.data.data;
          setUser({ tenant_id, email, name });
        } catch (error) {
          console.error('Auth check failed:', error);
          // Only clear tokens if it's actually an auth error, not a network error
          if (error instanceof Error && error.message.includes('Unauthorized')) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
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
      }>('/users/login', {
        method: 'POST',
        body: { email, password },
      });

      const { access, refresh, email: userEmail, name, tenant_id } = response.data.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser({ tenant_id, email: userEmail, name });
      
      toast({
        title: 'Welcome back!',
        description: 'You have been logged in successfully.',
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
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
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser({ tenant_id, email: userEmail, name: userName });
      
      toast({
        title: 'Account created!',
        description: 'Your account has been created successfully.',
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'Unable to create account. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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