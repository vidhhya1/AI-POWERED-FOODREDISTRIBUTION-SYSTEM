// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/'; // Your backend API base URL

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is 401 Unauthorized and it's not the refresh token request itself
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark request to prevent infinite loops

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('accessToken', access); // Update the new access token
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`; // Update Axios default header
          originalRequest.headers['Authorization'] = `Bearer ${access}`; // Update the failed request's header

          return api(originalRequest); // Retry the original request with the new token
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          // If refresh fails, log out the user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/'; // Redirect to login or home page
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, so just log out
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/'; // Redirect to login or home page
      }
    }
    return Promise.reject(error);
  }
);

export default api;