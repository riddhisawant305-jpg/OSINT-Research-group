import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cv_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 token expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear local storage
      const hadToken = localStorage.getItem("cv_token");
      if (hadToken && !window.location.pathname.includes("/login")) {
        localStorage.removeItem("cv_token");
        localStorage.removeItem("cv_user");
      }
    }
    return Promise.reject(error);
  }
);

export default API;
