import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor — reads token from Zustand store (no localStorage hit per request)
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor — handles 401 globally, errors handled per-page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

// Customer API
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getOne: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
}

// Item API
export const itemAPI = {
  getAll: (params) => api.get('/items', { params }),
  getOne: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
  updateStock: (id, data) => api.patch(`/items/${id}/stock`, data)
}

// Invoice API
export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getOne: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  updatePayment: (id, data) => api.patch(`/invoices/${id}/payment`, data),
  deletePayment: (id, paymentId) => api.delete(`/invoices/${id}/payment/${paymentId}`),
  downloadPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  downloadEWayBill: (id) => api.get(`/invoices/${id}/eway-bill`, { responseType: 'blob' })
}

// Transaction API
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: (params) => api.get('/transactions/summary', { params })
}

// Report API
export const reportAPI = {
  getSales: (params) => api.get('/reports/sales', { params }),
  getPurchases: (params) => api.get('/reports/purchases', { params }),
  getGST: (params) => api.get('/reports/gst', { params }),
  getProfitLoss: (params) => api.get('/reports/profit-loss', { params }),
  getStock: (params) => api.get('/reports/stock', { params }),
  getCustomers: () => api.get('/reports/customers'),
  downloadSalesPDF: (params) => api.get('/reports/sales/pdf', { params, responseType: 'blob' }),
  downloadPurchasesPDF: (params) => api.get('/reports/purchases/pdf', { params, responseType: 'blob' }),
  downloadStockPDF: () => api.get('/reports/stock/pdf', { responseType: 'blob' }),
  downloadGSTPDF: (params) => api.get('/reports/gst/pdf', { params, responseType: 'blob' })
}

export default api
