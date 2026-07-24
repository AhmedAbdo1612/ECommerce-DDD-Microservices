import axios from 'axios';
import { isTokenExpired } from '../utils/jwt';

// Use VITE_API_URL from .env which points to the exposed YARP gateway port (e.g. http://localhost:5000)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Important for slow container startups
});

// Event emitter helper for Debug Panel
const emitApiEvent = (type, data) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('api-debug', { detail: { type, ...data, timestamp: new Date() } });
    window.dispatchEvent(event);
  }
};

// Retry logic with exponential backoff
axiosInstance.interceptors.response.use(
  (response) => {
    emitApiEvent('response', { url: response.config.url, method: response.config.method, status: response.status });
    return response;
  },
  async (error) => {
    const config = error.config;
    emitApiEvent('error', { url: config?.url, method: config?.method, error: error.message, status: error.response?.status });
    
    // Check if error is network related or 5xx, and we haven't retried too many times
    if (config && (!config._retryCount || config._retryCount < 3) && (!error.response || error.response.status >= 500)) {
      config._retryCount = config._retryCount || 0;
      config._retryCount += 1;
      
      // Exponential backoff
      const delay = Math.pow(2, config._retryCount) * 1000;
      console.log(`Retry attempt ${config._retryCount} for ${config.url} after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return axiosInstance(config);
    }
    
    // JWT Expiration Logic
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=true';
    }
    
    return Promise.reject(error);
  }
);

// Intercept requests to attach the token
axiosInstance.interceptors.request.use(
  (config) => {
    emitApiEvent('request', { url: config.url, method: config.method });
    const token = localStorage.getItem('token');
    
    if (token) {
      if (!isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
