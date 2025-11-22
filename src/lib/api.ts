// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

  getStock: (id: string) => apiRequest<any>(`/products/${id}/stock`),

  generateSKU: (id: string) =>
    apiRequest<any>(`/products/${id}/generate-sku`, {
      method: 'POST',
    }),
};

// Categories API
export const categoriesApi = {
  getAll: () => apiRequest<any>('/categories'),

  create: (category: any) =>
    apiRequest<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    }),

  update: (id: string, category: any) =>
    apiRequest<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    }),

  delete: (id: string) =>
    apiRequest<any>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiRequest<any>('/dashboard/stats'),
};
