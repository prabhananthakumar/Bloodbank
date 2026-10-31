import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hemosync_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle unauthenticated sessions
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      if (localStorage.getItem('hemosync_token')) {
        localStorage.removeItem('hemosync_token');
        localStorage.removeItem('hemosync_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
  updateProfile: (profileData) => API.put('/auth/profile', profileData)
};

// Inventory endpoints
export const inventoryService = {
  getSummary: () => API.get('/inventory/summary'),
  getAllUnits: (params) => API.get('/inventory', { params }),
  addUnit: (unitData) => API.post('/inventory', unitData),
  updateTesting: (id, testData) => API.put(`/inventory/${id}/testing`, testData),
  purgeExpired: () => API.post('/inventory/purge-expired')
};

// Requests endpoints
export const requestService = {
  create: (requestData) => API.post('/requests', requestData),
  getMyRequests: () => API.get('/requests/my'),
  getAllRequests: (params) => API.get('/requests', { params }),
  reviewRequest: (id, reviewData) => API.put(`/requests/${id}/review`, reviewData),
  dispatchRequest: (id) => API.post(`/requests/${id}/dispatch`)
};

// Donations endpoints
export const donationService = {
  bookAppointment: (data) => API.post('/donations/book', data),
  getMyAppointments: () => API.get('/donations/my'),
  getAllAppointments: (params) => API.get('/donations', { params }),
  processDonation: (id, vitalsData) => API.post(`/donations/${id}/process`, vitalsData)
};

// Blood Camps endpoints
export const campService = {
  getAllCamps: (params) => API.get('/camps', { params }),
  getCampById: (id) => API.get(`/camps/${id}`),
  createCamp: (campData) => API.post('/camps', campData),
  updateCamp: (id, data) => API.put(`/camps/${id}`, data)
};

// Analytics & Public tools
export const analyticsService = {
  getDashboardMetrics: () => API.get('/analytics/dashboard'),
  checkCompatibility: (data) => API.post('/analytics/check-compatibility', data)
};

export default API;
