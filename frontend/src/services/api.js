import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and 401 unauthorized
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Network Error';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
};

// Water Level API
export const waterAPI = {
  getAll: () => API.get('/water'),
  getLatest: () => API.get('/water/latest'),
  getById: (id) => API.get(`/water/${id}`),
  create: (data) => API.post('/water', data),
  remove: (id) => API.delete(`/water/${id}`),
};

// Settings API
export const settingsAPI = {
  get: () => API.get('/settings'),
  update: (data) => API.post('/settings', data),
};

// Device Status API
export const deviceStatusAPI = {
  get: () => API.get('/device-status'),
  update: (data) => API.post('/device-status', data),
  edit: (id, data) => API.put(`/device-status/${id}`, data),
  remove: (id) => API.delete(`/device-status/${id}`),
};

export default API;
