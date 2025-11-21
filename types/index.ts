// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'customer' | 'admin';
  address?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  product_code: string;
  description?: string;
  unit?: string;
  average_rating?: number;
  rating_count?: number;
  created_at?: string;
  updated_at?: string;
}
