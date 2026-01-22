import apiClient from './client';
import {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '../types/api';

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    
    // Store token and user data
    if (response.data.token) {
      apiClient.setAuthToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response;
  },

  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    
    // Store token and user data
    if (response.data.token) {
      apiClient.setAuthToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response;
  },

  /**
   * Staff login
   */
  staffLogin: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/staff/login', credentials);
    
    // Store token and user data
    if (response.data.token) {
      apiClient.setAuthToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/logout');
      return response;
    } catch (error) {
      // Log error in development, but don't throw - logout should always succeed locally
      if (process.env.NODE_ENV === 'development') {
        console.warn('Backend logout failed, clearing local session:', error);
      }
      // Return a mock success response
      return { success: true, message: 'Logged out locally' } as ApiResponse;
    } finally {
      // Clear local storage regardless of API response
      apiClient.clearAuthToken();
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiClient.get<ApiResponse<User>>('/user/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiClient.put<ApiResponse<User>>('/user/profile', data);
  },

  /**
   * Update password
   */
  updatePassword: async (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse> => {
    return apiClient.put<ApiResponse>('/user/profile/password', data);
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (data: { email: string }): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/auth/forgot-password', data);
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/auth/reset-password', data);
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },
};

export default authApi;
