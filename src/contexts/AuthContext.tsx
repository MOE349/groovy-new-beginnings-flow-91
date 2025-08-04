import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type User } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/utils/errorHandling';
import { usePermissionsStore } from '@/stores/permissionsStore';
import { invalidateAllQueries, refetchOnLogin } from '@/lib/react-query';

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
  const { setPermissions, setUserRole, clearPermissions } = usePermissionsStore();

  const isAuthenticated = !!user;

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = () => {
      const user = authService.getStoredUser();
      
      if (user && authService.isAuthenticated()) {
        setUser(user);
        // Restore permissions if available
        if (user.role) {
          setUserRole(user.role);
        }
        if (user.permissions) {
          setPermissions(user.permissions);
        }
      } else {
        // Clear any partial auth state
        authService.logout();
        clearPermissions();
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authData = await authService.login({ email, password });
      
      const userData: User = {
        tenant_id: authData.tenant_id,
        email: authData.email,
        name: authData.name,
      };
      
      localStorage.setItem('access_token', authData.access);
      localStorage.setItem('refresh_token', authData.refresh);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      // Set permissions if available
      if (userData.role) {
        setUserRole(userData.role);
      }
      if (userData.permissions) {
        setPermissions(userData.permissions);
      }
      
      toast({
        title: 'Welcome back!',
        description: 'You have been logged in successfully.',
      });
      
      // Refetch queries after successful login
      refetchOnLogin();
      
      return true;
    } catch (error) {
      handleApiError(error, 'Login failed');
      return false;
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      const authData = await authService.register({ email, password, name });
      
      const userData: User = {
        tenant_id: authData.tenant_id,
        email: authData.email,
        name: authData.name,
      };
      
      localStorage.setItem('access_token', authData.access);
      localStorage.setItem('refresh_token', authData.refresh);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      // Set permissions if available
      if (userData.role) {
        setUserRole(userData.role);
      }
      if (userData.permissions) {
        setPermissions(userData.permissions);
      }
      
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
    authService.logout();
    setUser(null);
    clearPermissions();
    
    // Clear all cached queries on logout
    invalidateAllQueries();
    
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