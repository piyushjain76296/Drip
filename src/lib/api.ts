// ============================================================
// DRIP. — Centralized API Client
// All API calls go through here
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers,
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API Error: ${res.status}`);
  }

  return res.json();
}

// ============================================================
// Products
// ============================================================
export const api = {
  products: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<any>(`/api/products${query}`);
    },
    get: (slug: string) => apiFetch<any>(`/api/products/${slug}`),
    create: (data: any, token: string) =>
      apiFetch<any>('/api/products', { method: 'POST', body: JSON.stringify(data), token }),
    update: (id: string, data: any, token: string) =>
      apiFetch<any>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
    delete: (id: string, token: string) =>
      apiFetch<any>(`/api/products/${id}`, { method: 'DELETE', token }),
  },

  // ============================================================
  // Categories
  // ============================================================
  categories: {
    list: () => apiFetch<any[]>('/api/categories'),
    create: (data: any, token: string) =>
      apiFetch<any>('/api/categories', { method: 'POST', body: JSON.stringify(data), token }),
    update: (id: string, data: any, token: string) =>
      apiFetch<any>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
    delete: (id: string, token: string) =>
      apiFetch<any>(`/api/categories/${id}`, { method: 'DELETE', token }),
  },

  // ============================================================
  // Collections
  // ============================================================
  collections: {
    list: () => apiFetch<any[]>('/api/collections'),
    get: (slug: string) => apiFetch<any>(`/api/collections/${slug}`),
    create: (data: any, token: string) =>
      apiFetch<any>('/api/collections', { method: 'POST', body: JSON.stringify(data), token }),
    update: (id: string, data: any, token: string) =>
      apiFetch<any>(`/api/collections/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
    delete: (id: string, token: string) =>
      apiFetch<any>(`/api/collections/${id}`, { method: 'DELETE', token }),
  },

  // ============================================================
  // Reviews
  // ============================================================
  reviews: {
    list: (productId: string, params?: Record<string, string>) => {
      const query = new URLSearchParams({ productId, ...params }).toString();
      return apiFetch<any>(`/api/reviews?${query}`);
    },
    create: (data: any, token: string) =>
      apiFetch<any>('/api/reviews', { method: 'POST', body: JSON.stringify(data), token }),
    delete: (id: string, token: string) =>
      apiFetch<any>(`/api/reviews/${id}`, { method: 'DELETE', token }),
    adminList: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<any>(`/api/reviews/admin${query}`, { token });
    },
  },

  // ============================================================
  // Orders
  // ============================================================
  orders: {
    create: (data: any, token: string) =>
      apiFetch<any>('/api/orders', { method: 'POST', body: JSON.stringify(data), token }),
    list: (token: string) => apiFetch<any[]>('/api/orders', { token }),
    get: (id: string, token: string) => apiFetch<any>(`/api/orders/${id}`, { token }),
    adminList: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<any>(`/api/orders/admin/all${query}`, { token });
    },
    updateStatus: (id: string, data: any, token: string) =>
      apiFetch<any>(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data), token }),
  },

  // ============================================================
  // Banners
  // ============================================================
  banners: {
    list: () => apiFetch<any[]>('/api/banners'),
    adminList: (token: string) => apiFetch<any[]>('/api/banners/admin', { token }),
    create: (data: any, token: string) =>
      apiFetch<any>('/api/banners', { method: 'POST', body: JSON.stringify(data), token }),
    update: (id: string, data: any, token: string) =>
      apiFetch<any>(`/api/banners/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
    delete: (id: string, token: string) =>
      apiFetch<any>(`/api/banners/${id}`, { method: 'DELETE', token }),
  },

  // ============================================================
  // Coupons
  // ============================================================
  coupons: {
    list: (token: string) => apiFetch<any[]>('/api/coupons', { token }),
    create: (data: any, token: string) =>
      apiFetch<any>('/api/coupons', { method: 'POST', body: JSON.stringify(data), token }),
    update: (id: string, data: any, token: string) =>
      apiFetch<any>(`/api/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
    delete: (id: string, token: string) =>
      apiFetch<any>(`/api/coupons/${id}`, { method: 'DELETE', token }),
    validate: (code: string, subtotal: number) =>
      apiFetch<any>('/api/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),
  },

  // ============================================================
  // Cart (server-synced)
  // ============================================================
  cart: {
    get: (token: string) => apiFetch<any[]>('/api/cart', { token }),
    add: (data: any, token: string) =>
      apiFetch<any>('/api/cart', { method: 'POST', body: JSON.stringify(data), token }),
    update: (productId: string, size: string, color: string, quantity: number, token: string) =>
      apiFetch<any>('/api/cart/line', {
        method: 'PUT',
        body: JSON.stringify({ productId, size, color, quantity }),
        token,
      }),
    remove: (productId: string, size: string, color: string, token: string) =>
      apiFetch<any>('/api/cart/line', {
        method: 'DELETE',
        body: JSON.stringify({ productId, size, color }),
        token,
      }),
    clear: (token: string) =>
      apiFetch<any>('/api/cart', { method: 'DELETE', token }),
  },

  // ============================================================
  // Auth / Profile
  // ============================================================
  auth: {
    profile: (token: string) => apiFetch<any>('/api/auth/profile', { token }),
    updateProfile: (data: any, token: string) =>
      apiFetch<any>('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data), token }),
  },

  // ============================================================
  // Addresses
  // ============================================================
  addresses: {
    list: (token: string) => apiFetch<any[]>('/api/addresses', { token }),
    create: (data: any, token: string) =>
      apiFetch<any>('/api/addresses', { method: 'POST', body: JSON.stringify(data), token }),
    update: (id: string, data: any, token: string) =>
      apiFetch<any>(`/api/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
    delete: (id: string, token: string) =>
      apiFetch<any>(`/api/addresses/${id}`, { method: 'DELETE', token }),
  },

  // ============================================================
  // Dashboard (Admin)
  // ============================================================
  dashboard: {
    stats: (token: string) => apiFetch<any>('/api/dashboard/stats', { token }),
  },

  // ============================================================
  // Upload
  // ============================================================
  upload: {
    single: async (file: File, folder: string, token: string) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    multiple: async (files: File[], folder: string, token: string) => {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      formData.append('folder', folder);

      const res = await fetch(`${API_URL}/api/upload/multiple`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
  },

  // ============================================================
  // Customers (Admin)
  // ============================================================
  customers: {
    list: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<any>(`/api/customers${query}`, { token });
    },
  },
};
