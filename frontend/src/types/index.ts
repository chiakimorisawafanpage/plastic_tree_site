export interface Product {
  id: number;
  title: string;
  artist: string;
  year: number;
  price: number;
  description: string;
  image_url: string;
  tracklist: string[];
  genre: string;
  format: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  title: string;
  artist: string;
  price: number;
  image_url: string;
  year: number;
  quantity: number;
}

export interface Order {
  id: number;
  total: number;
  status: string;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  product_id: number;
  title: string;
  price: number;
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  created_at?: string;
}
