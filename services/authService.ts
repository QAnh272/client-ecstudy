import { api, endpoints } from '@/lib/api';
import type { User, AuthResponse, ApiResponse } from '@/types';

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  // Register
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(endpoints.auth.register, data);
    
    if (!response.data) throw new Error(response.message || 'Đăng ký thất bại');
    
    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(endpoints.auth.login, {
      email,
      password,
    });
    
    if (!response.data) throw new Error(response.message || 'Đăng nhập thất bại');
    
    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post(endpoints.auth.logout);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  // Get user from localStorage
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  // Check if admin
  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'admin';
  },
};
