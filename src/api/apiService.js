import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    console.log('Making request to:', config.url);
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', {
      baseURL: error.config?.baseURL,
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      status: error.response?.status,
      fullUrl: `${error.config?.baseURL}${error.config?.url}`,
      message: error.message
    });

    if (error.message === 'Network Error') {
      console.error('Network error - Please check if the server is running at', error.config?.baseURL);
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    // Transform the data to match the backend's expected format
    const signupData = {
      name: `${userData.firstName} ${userData.lastName}`.trim(), // Combine first and last name
      email: userData.email,
      password: userData.password,
      phone_number: userData.phoneNumber
    };

    console.log('Sending signup data:', signupData);
    const response = await api.post('/auth/signup', signupData);
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// User endpoints
export const updateProfile = async (userData) => {
  return api.put('/users/profile', userData);
};

export const updatePassword = async (currentPassword, newPassword) => {
  return api.put('/users/password', { currentPassword, newPassword });
};

// Vendor endpoints
export const getVendors = async (params = {}) => {
  return api.get('/vendors', { params });
};

export const getVendorById = async (id) => {
  return api.get(`/vendors/${id}`);
};

export const createVendor = async (vendorData) => {
  return api.post('/vendors', vendorData);
};

export const updateVendor = async (id, vendorData) => {
  return api.put(`/vendors/${id}`, vendorData);
};

export const deleteVendor = async (id) => {
  return api.delete(`/vendors/${id}`);
};

// Product endpoints
export const getProducts = async (params = {}) => {
  return api.get('/products', { params });
};

export const getProductById = async (id) => {
  return api.get(`/products/${id}`);
};

export const createProduct = async (productData) => {
  return api.post('/products', productData);
};

export const updateProduct = async (id, productData) => {
  return api.put(`/products/${id}`, productData);
};

export const deleteProduct = async (id) => {
  return api.delete(`/products/${id}`);
};

// Order endpoints
export const getOrders = async (params = {}) => {
  return api.get('/orders', { params });
};

export const getOrderById = async (id) => {
  return api.get(`/orders/${id}`);
};

export const createOrder = async (orderData) => {
  return api.post('/orders', orderData);
};

export const updateOrderStatus = async (id, status) => {
  return api.put(`/orders/${id}/status`, { status });
};

// Cart endpoints
export const getCart = async () => {
  return api.get('/cart');
};

export const addToCart = async (productId, quantity) => {
  return api.post('/cart/items', { productId, quantity });
};

export const updateCartItem = async (itemId, quantity) => {
  return api.put(`/cart/items/${itemId}`, { quantity });
};

export const removeFromCart = async (itemId) => {
  return api.delete(`/cart/items/${itemId}`);
};

export const clearCart = async () => {
  return api.delete('/cart');
};

export default api; 