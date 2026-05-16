import { useAuth } from '../context/AuthContext';
import { Product, CartItem, Order } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_AUTH = import.meta.env.VITE_API_AUTH || '';

export function useApi() {
  const { token } = useAuth();

  const headers = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    if (API_AUTH) h['Authorization'] = h['Authorization'] || `Basic ${btoa(API_AUTH)}`;
    return h;
  };

  const publicHeaders = (): Record<string, string> => {
    const h: Record<string, string> = {};
    if (API_AUTH) h['Authorization'] = `Basic ${btoa(API_AUTH)}`;
    return h;
  };

  async function getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/api/products`, { headers: publicHeaders() });
    return res.json();
  }

  async function getProduct(id: number): Promise<Product> {
    const res = await fetch(`${API_URL}/api/products/${id}`, { headers: publicHeaders() });
    return res.json();
  }

  async function getCart(): Promise<CartItem[]> {
    const res = await fetch(`${API_URL}/api/cart`, { headers: headers() });
    if (!res.ok) return [];
    return res.json();
  }

  async function addToCart(productId: number, quantity: number = 1) {
    await fetch(`${API_URL}/api/cart`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async function updateCartItem(itemId: number, productId: number, quantity: number) {
    await fetch(`${API_URL}/api/cart/${itemId}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async function removeFromCart(itemId: number) {
    await fetch(`${API_URL}/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: headers(),
    });
  }

  async function checkout(paymentMethod: string = 'card') {
    const res = await fetch(`${API_URL}/api/checkout`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ payment_method: paymentMethod }),
    });
    return res.json();
  }

  async function getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_URL}/api/orders`, { headers: headers() });
    if (!res.ok) return [];
    return res.json();
  }

  return { getProducts, getProduct, getCart, addToCart, updateCartItem, removeFromCart, checkout, getOrders };
}
