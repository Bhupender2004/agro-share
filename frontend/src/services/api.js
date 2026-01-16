import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth token here later
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('agroshare_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// User API
export const userAPI = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  getAllUsers: (params) => api.get('/users', { params }),
};

// Machine API
export const machineAPI = {
  getAll: (params) => api.get('/machines', { params }),
  getById: (id) => api.get(`/machines/${id}`),
  create: (data) => api.post('/machines', data),
  update: (id, data) => api.put(`/machines/${id}`, data),
  delete: (id) => api.delete(`/machines/${id}`),
  getByOwner: (ownerId) => api.get(`/machines/owner/${ownerId}`),
  updateAvailability: (id, data) => api.patch(`/machines/${id}/availability`, data),
  searchNearby: (params) => api.get('/machines/search/nearby', { params }),
};

// Booking API
export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  confirm: (id) => api.patch(`/bookings/${id}/confirm`),
  complete: (id, data) => api.patch(`/bookings/${id}/complete`, data),
  getByFarmer: (farmerId, params) => api.get(`/bookings/farmer/${farmerId}`, { params }),
  getByOwner: (ownerId, params) => api.get(`/bookings/owner/${ownerId}`, { params }),
  getMachineSchedule: (machineId, date) => api.get(`/bookings/schedule/${machineId}`, { params: { date } }),
  autoSchedule: (data) => api.post('/bookings/schedule', data),
};
