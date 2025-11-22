// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

// Products API
export const productsApi = {
  getAll: (params?: {
    search?: string;
    category?: string;
    location?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiRequest<any>(`/products?${queryParams.toString()}`);
  },

  getById: (id: string) => apiRequest<any>(`/products/${id}`),

  create: (product: any) =>
    apiRequest<any>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  update: (id: string, product: any) =>
    apiRequest<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),

  delete: (id: string) =>
    apiRequest<any>(`/products/${id}`, {
      method: 'DELETE',
    }),

  getLocations: (id: string) => apiRequest<any>(`/products/${id}/stock`),

  getCategories: () => apiRequest<any>('/products/categories/list'),

  generateSku: (payload: { name: string; category: string }) =>
    apiRequest<any>('/products/generate-sku', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// Locations API
export const locationsApi = {
  getAll: () => apiRequest<any>('/locations'),

  getById: (id: string) => apiRequest<any>(`/locations/${id}`),

  create: (location: any) =>
    apiRequest<any>('/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    }),

  update: (id: string, location: any) =>
    apiRequest<any>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(location),
    }),

  delete: (id: string) =>
    apiRequest<any>(`/locations/${id}`, {
      method: 'DELETE',
    }),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiRequest<any>('/dashboard/stats'),
};
