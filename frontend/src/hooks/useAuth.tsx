'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, AuthTokens } from '@/types';
import { apiClient } from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errorHandler';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      setUser(response.data);
    } catch (error: any) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      const tokens: AuthTokens = response.data;
      
      Cookies.set('access_token', tokens.access_token, { expires: 7 });
      Cookies.set('refresh_token', tokens.refresh_token, { expires: 30 });
      
      await fetchUser();
    } catch (error: any) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error(getErrorMessage(error) || 'Login failed');
      }
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiClient.register(userData);
      toast.success('Registration successful! Please login.');
    } catch (error: any) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error(getErrorMessage(error) || 'Registration failed');
      }
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}