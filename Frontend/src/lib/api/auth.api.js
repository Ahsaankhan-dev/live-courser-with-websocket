import apiClient from './client';

export const authApi = {
  // Register new user
  register: async (name, email, password) => {
    const response = await apiClient.post('/api/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  // List other registered users for the dashboard people sidebar
  getUsers: async () => {
    const response = await apiClient.get('/api/auth/users');
    return response.data;
  },

  // Refresh access token
  refreshToken: async () => {
    const response = await apiClient.post('/api/auth/refresh-token');
    return response.data;
  },
};
