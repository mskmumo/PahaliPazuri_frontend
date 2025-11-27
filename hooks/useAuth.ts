'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { User, LoginCredentials, RegisterData } from '@/lib/types/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const storedUser = authApi.getStoredUser();
    const isAuth = authApi.isAuthenticated();

    if (isAuth && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.login(credentials);
      setUser(response.data.user);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const staffLogin = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.staffLogin(credentials);
      setUser(response.data.user);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.register(data);
      setUser(response.data.user);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authApi.logout();
    } catch (err) {
      // Silently handle logout errors since we clear local state anyway
      // The authApi.logout() already clears tokens in its finally block
      if (process.env.NODE_ENV === 'development') {
        console.warn('Logout API call failed (local state cleared):', err);
      }
    } finally {
      setUser(null);
      setLoading(false);
      // Redirect to home page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.updateProfile(data);
      setUser(response.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get role slug
  const getUserRole = (): string | undefined => {
    if (!user) return undefined;
    return typeof user.role === 'string' ? user.role : user.role?.slug;
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: getUserRole() === 'admin' || getUserRole() === 'super-admin',
    isSuperAdmin: getUserRole() === 'super-admin',
    isTenant: getUserRole() === 'tenant',
    login,
    staffLogin,
    register,
    logout,
    refreshProfile,
    updateProfile,
  };
}
