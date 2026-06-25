import axios from 'axios';
import { API_URL } from './config';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
};

// Air Quality API
export const airQualityAPI = {
  getCityData: (city, limit = 100) => api.get(`/api/air-quality/city/${city}?limit=${limit}`),
  getLatest: () => api.get('/api/air-quality/latest'),
  getTrends: (city, days = 7) => api.get(`/api/air-quality/trends/${city}?days=${days}`),
  getStats: (city, days = 30) => api.get(`/api/air-quality/stats/${city}?days=${days}`),
  getCities: () => api.get('/api/air-quality/cities'),
  save: (data) => api.post('/api/air-quality/save', data),
};

// Water Quality API
export const waterQualityAPI = {
  getCityData: (city, limit = 100) => api.get(`/api/water-quality/city/${city}?limit=${limit}`),
  getLatest: () => api.get('/api/water-quality/latest'),
  getTrends: (city, days = 7) => api.get(`/api/water-quality/trends/${city}?days=${days}`),
  getStats: (city, days = 30) => api.get(`/api/water-quality/stats/${city}?days=${days}`),
  getCities: () => api.get('/api/water-quality/cities'),
  save: (data) => api.post('/api/water-quality/save', data),
};

export default api;
