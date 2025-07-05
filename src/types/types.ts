// types.ts - Shared type definitions for the application

export interface Review {
  id: string;
  rating: number;
  comment: string  // Using null to match Supabase response
  user_id: string;
  product_id: string;
  created_at: string 
  updated_at: string 
  users: {
    full_name: string 
    avatar_url: string;
  } | null;
}


export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  stock_quantity?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  full_name: string | null;
  avatar_url: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: number;
  slug: string;
  user: string;
  totalPrice: number;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: number;
  order: number;
  product: number;
  quantity: number;
  created_at?: string;
}