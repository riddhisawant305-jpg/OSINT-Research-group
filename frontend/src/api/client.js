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
    // If an Authorization header was already explicitly provided, respect it!
    if (config.headers && config.headers.Authorization) {
      return config;
    }

    // Check for admin token ONLY if requesting an admin endpoint or on the admin page
    const isAdminEndpoint = config.url && (config.url.startsWith("/admin") || config.url.includes("/admin/"));
    const isOnAdminPage = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
    const adminToken = localStorage.getItem("cv_admin_token");
    const regularToken = localStorage.getItem("cv_token");

    let token = null;
    if (isAdminEndpoint || isOnAdminPage) {
      token = adminToken || regularToken;
    } else {
      token = regularToken;
    }

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
