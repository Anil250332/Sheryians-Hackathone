import axios from "axios";

const backendBase =
  import.meta.env.VITE_API_URL || "https://sheriyansh-hackthon-backend.onrender.com";

const api = axios.create({
  baseURL: backendBase ? `${backendBase.replace(/\/+$/, "")}/api/v1` : "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("proctor_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("proctor_token");
      localStorage.removeItem("proctor_user");
      // Let AuthContext handle redirect or state reset
    }
    return Promise.reject(error);
  }
);

export default api;
