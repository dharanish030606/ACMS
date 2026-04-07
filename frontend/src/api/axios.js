import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_URL || '';
if (baseUrl && !baseUrl.endsWith('/api') && !baseUrl.endsWith('/api/')) {
  baseUrl = baseUrl.replace(/\/$/, "") + '/api';
}

const api = axios.create({
  baseURL: baseUrl || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('acms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('acms_token');
      localStorage.removeItem('acms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
