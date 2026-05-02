import axios from "axios";

/**
 * Pre-configured Axios instance.
 * - baseURL proxied via Vite to http://localhost:5000
 * - Request interceptor: injects JWT from localStorage
 * - Response interceptor: logs out on 401
 */
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ttm_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — clear storage and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ttm_token");
      localStorage.removeItem("ttm_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
