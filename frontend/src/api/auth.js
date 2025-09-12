import api from './axios.js';

// Authentication API functions
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user profile (if needed)
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};
