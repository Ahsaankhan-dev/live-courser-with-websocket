import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true, // Important for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    // But with HttpOnly cookies, they're sent automatically
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthAction = /\/api\/auth\/(login|register|refresh-token)(?:\?|$)/.test(requestUrl);

    // Handle token expiration
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthAction) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await apiClient.post('/api/auth/refresh-token');

        // Retry the original request
        return apiClient(originalRequest);
      } catch {
        // Let the calling page decide how to handle an expired session. The
        // auth provider also calls /me on public pages, where forced redirects
        // would incorrectly send signed-out visitors to the login screen.
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
