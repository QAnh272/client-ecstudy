import { api, endpoints } from '@/lib/api';
import type { User, AuthResponse, ApiResponse } from '@/types';

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  // Register
  async register(data: RegisterData, rememberMe: boolean = false): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(endpoints.auth.register, data);
    
    if (!response.data) throw new Error(response.message || 'Đăng ký thất bại');
    
    // Store token based on rememberMe option
    this.storeAuth(response.data.token, response.data.user, rememberMe);
    
    return response.data;
  },

  // Login
  async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(endpoints.auth.login, {
      email,
      password,
    });
    
    if (!response.data) throw new Error(response.message || 'Đăng nhập thất bại');
    
    // Store token based on rememberMe option
    this.storeAuth(response.data.token, response.data.user, rememberMe);
    
    return response.data;
  },

  // Store authentication data
  storeAuth(token: string, user: User, rememberMe: boolean): void {
    if (typeof window === 'undefined') return;
    
    const storage = rememberMe ? localStorage : sessionStorage;
    const expiryTime = rememberMe ? Date.now() + (60 * 60 * 1000) : null; // 1 hour if remember
    
    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(user));
    
    if (rememberMe && expiryTime) {
      storage.setItem('tokenExpiry', expiryTime.toString());
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post(endpoints.auth.logout);
    } finally {
      this.clearAuth();
    }
  },

  // Clear all auth data
  clearAuth(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  // Get stored token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Check localStorage first (remember me)
    let token = localStorage.getItem('token');
    if (token) {
      // Check if token expired
      const expiry = localStorage.getItem('tokenExpiry');
      if (expiry && Date.now() > parseInt(expiry)) {
        this.clearAuth();
        return null;
      }
      return token;
    }
    
    // Check sessionStorage (current session)
    token = sessionStorage.getItem('token');
    return token;
  },

  // Get user from storage
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    // Check localStorage first
    let userStr = localStorage.getItem('user');
    if (!userStr) {
      // Check sessionStorage
      userStr = sessionStorage.getItem('user');
    }
    
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Check if admin
  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'admin';
  },
};
