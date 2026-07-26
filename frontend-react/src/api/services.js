import { axiosInstance } from './axios';

// Service Layer for all microservices
export const api = {
  // --- Gateway Health Check ---
  health: {
    checkGateway: () => axiosInstance.get('/products?PageSize=1').then(res => res.status === 200),
  },

  // --- Catalog Service ---
  catalog: {
    getProducts: (page = 1, size = 10, category = '') => 
      axiosInstance.get(`/products?PageNumber=${page}&PageSize=${size}${category ? `&Category=${category}` : ''}`),
    getProductById: (id) => axiosInstance.get(`/products/${id}`),
    createProduct: (data) => axiosInstance.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    updateProduct: (data) => axiosInstance.put('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deleteProduct: (id) => axiosInstance.delete(`/products/${id}`),
  },

  // --- Basket Service ---
  basket: {
    getBasket: (userName) => axiosInstance.get(`/basket/${userName}`),
    storeBasket: (data) => axiosInstance.post('/basket', data),
    addItem: (userName, data) => axiosInstance.post(`/basket/${userName}/items`, data),
    updateItemQuantity: (userName, productId, data) => axiosInstance.put(`/basket/${userName}/items/${productId}`, data),
    removeItem: (userName, productId) => axiosInstance.delete(`/basket/${userName}/items/${productId}`),
    checkout: (data) => axiosInstance.post('/basket/Checkout', data),
    deleteBasket: (userName) => axiosInstance.delete(`/basket/${userName}`),
  },

  // --- Ordering Service ---
  ordering: {
    getOrders: (page = 1, size = 10) => axiosInstance.get(`/orders?PageIndex=${page}&PageSize=${size}`),
    getOrderById: (id) => axiosInstance.get(`/orders/${id}`),
    getOrdersByCustomer: (customerId) => axiosInstance.get(`/orders/customer/${customerId}`),
    getMyOrders: () => axiosInstance.get('/orders/my-orders'),
    createOrder: (data) => axiosInstance.post('/orders', data),
    deleteOrder: (id) => axiosInstance.delete(`/orders/${id}`),
  },

  // --- Identity Service ---
  identity: {
    login: (email, password) => axiosInstance.post('/api/auth/login', { email, password }),
    register: (data) => axiosInstance.post('/api/auth/register', data),
    getMe: () => axiosInstance.get('/api/auth/me'),
    getUsers: () => axiosInstance.get('/api/auth/users'),
    logout: () => axiosInstance.post('/api/auth/logout', {}),
  },

  // --- Discount Service ---
  discount: {
    getDiscount: (productName) => axiosInstance.get(`/discount.DiscountProtoService/GetDiscount?productName=${productName}`),
    createDiscount: (data) => axiosInstance.post('/discount.DiscountProtoService/CreateDiscount', data),
    updateDiscount: (data) => axiosInstance.put('/discount.DiscountProtoService/UpdateDiscount', data),
    deleteDiscount: (productName) => axiosInstance.delete(`/discount.DiscountProtoService/DeleteDiscount?productName=${productName}`),
  },

  // --- Media Service ---
  media: {
    upload: (formData) => axiosInstance.post('/api/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (fileName) => axiosInstance.delete(`/api/media/${fileName}`),
  }
};
