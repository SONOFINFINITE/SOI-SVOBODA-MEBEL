/**
 * Запросы к бэкенду. В dev — пустой URL, запросы идут на свой origin, Vite проксирует /api → localhost:3001.
 * В prod — VITE_API_URL из .env.production.
 * Важно: без запущенного backend (node server.js) XML-товары и заказы не работают.
 */
import type { Product } from '../data/catalog';
import type { OrderPayload, Order } from '../types/cart';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'http://localhost:3001');

function getHeaders(adminToken?: string): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (adminToken) {
    headers['X-Admin-Token'] = adminToken;
    headers['Authorization'] = `Bearer ${adminToken}`;
  }
  return headers;
}

export interface ApiResponse {
  success: boolean;
  products: Product[];
  cached?: boolean;
  count?: number;
  error?: string;
  message?: string;
}

export async function fetchXmlProducts(): Promise<Product[]> {
  const url = `${API_BASE_URL}/api/products/xml`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error(
        'API вернул не JSON. URL:', url,
        'Status:', response.status,
        'Content-Type:', contentType,
        'Начало ответа:', text.slice(0, 100)
      );
      throw new Error(`Сервер вернул HTML вместо JSON (проверьте, что запрос идёт на ${url} и Nginx проксирует /api)`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const data: ApiResponse = await response.json();
    if (data.success && data.products) {
      return data.products;
    }
    throw new Error(data.error || 'Неизвестная ошибка при загрузке продуктов');
  } catch (error) {
    console.error('Ошибка при загрузке продуктов из XML:', error);
    return [];
  }
}

export async function refreshXmlProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/xml/refresh`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    
    if (data.success && data.products) {
      return data.products;
    } else {
      throw new Error(data.error || 'Неизвестная ошибка при обновлении продуктов');
    }
  } catch (error) {
    console.error('Ошибка при обновлении продуктов:', error);
    throw error;
  }
}

export async function submitOrder(payload: OrderPayload): Promise<{ success: boolean; order?: Order; error?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error || 'Ошибка отправки заказа' };
  return { success: true, order: data.order };
}

export async function getOrders(adminToken: string): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    headers: getHeaders(adminToken),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка загрузки заказов');
  return data.orders || [];
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  adminToken: string
): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: getHeaders(adminToken),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка обновления заказа');
  return data.order;
}

export async function adminLogin(login: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ login, password }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error || 'Ошибка входа' };
  return { success: true, token: data.token };
}

export interface AdminUser {
  login: string;
}

export async function getAdminUsers(adminToken: string): Promise<AdminUser[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    headers: getHeaders(adminToken),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка загрузки пользователей');
  return data.users || [];
}

export async function createAdminUser(
  login: string,
  password: string,
  adminToken: string
): Promise<AdminUser[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: 'POST',
    headers: getHeaders(adminToken),
    body: JSON.stringify({ login, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка создания пользователя');
  return data.users || [];
}

export async function resetAdminPassword(
  login: string,
  newPassword: string,
  adminToken: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/reset-password`, {
    method: 'POST',
    headers: getHeaders(adminToken),
    body: JSON.stringify({ login, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сброса пароля');
}

export interface NotificationSettings {
  telegramBotToken: string;
  telegramChatId: string;
  email: string;
}

export async function getNotificationSettings(adminToken: string): Promise<NotificationSettings> {
  const res = await fetch(`${API_BASE_URL}/api/admin/notification-settings`, {
    headers: getHeaders(adminToken),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка загрузки настроек');
  return data.settings || { telegramBotToken: '', telegramChatId: '', email: '' };
}

export async function saveNotificationSettings(
  settings: Partial<NotificationSettings>,
  adminToken: string
): Promise<NotificationSettings> {
  const res = await fetch(`${API_BASE_URL}/api/admin/notification-settings`, {
    method: 'PUT',
    headers: getHeaders(adminToken),
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');
  return data.settings;
}

export type ProductOverrides = Record<string, {
  name?: string;
  price?: string;
  image?: string;
  salePrice?: string;
  isSale?: boolean;
}>;

export async function getPublicProductOverrides(): Promise<ProductOverrides> {
  const res = await fetch(`${API_BASE_URL}/api/product-overrides`);
  const data = await res.json();
  if (!res.ok) return {};
  return data.overrides || {};
}

export async function getProductOverrides(adminToken: string): Promise<ProductOverrides> {
  const res = await fetch(`${API_BASE_URL}/api/admin/product-overrides`, {
    headers: getHeaders(adminToken),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка загрузки правок');
  return data.overrides || {};
}

export async function saveProductOverrides(
  overrides: ProductOverrides,
  adminToken: string
): Promise<ProductOverrides> {
  const res = await fetch(`${API_BASE_URL}/api/admin/product-overrides`, {
    method: 'PUT',
    headers: getHeaders(adminToken),
    body: JSON.stringify({ overrides }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сохранения правок');
  return data.overrides || {};
}
