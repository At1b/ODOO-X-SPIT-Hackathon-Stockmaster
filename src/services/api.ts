import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Operations API
export const operationsAPI = {
  createReceipt: (data) => api.post('/operations/receipt', data),

  createDelivery: (data) => api.post('/operations/delivery', data),

  createTransfer: (data) => api.post('/operations/transfer', data),

  getOperations: (params) => api.get('/operations', { params }),

  getOperationById: (id) => api.get(`/operations/${id}`),

  validateOperation: (id) => api.put(`/operations/${id}/validate`),
};

// Data API (for fetching products, warehouses, locations)
export const dataAPI = {
  getProducts: () => api.get('/products'),
  getWarehouses: () => api.get('/warehouses'),
  getLocations: () => api.get('/locations'),
};

// ⭐⭐ THIS WAS MISSING → FIXES YOUR ERROR ⭐⭐
export default api;
