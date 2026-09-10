import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/client";
import { currentUser as defaultDummyUser } from "../data/dummyData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("cv_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("cv_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultDummyUser;
      }
    }
    return defaultDummyUser;
  });
  const [loading, setLoading] = useState(true);

  // Fetch /api/auth/me on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("cv_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/auth/me");
        if (res.data && res.data.data) {
          const freshUser = res.data.data;
          setUser(freshUser);
          localStorage.setItem("cv_user", JSON.stringify(freshUser));
        }
      } catch (err) {
        console.warn("Session validation failed, using cached session or login required.");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    if (res.data && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.data);
      localStorage.setItem("cv_token", res.data.token);
      localStorage.setItem("cv_user", JSON.stringify(res.data.data));
      return res.data;
    }
    throw new Error(res.data.message || "Login failed");
  };

  const signup = async (formData) => {
    const res = await API.post("/auth/register", formData);
    if (res.data && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.data);
      localStorage.setItem("cv_token", res.data.token);
      localStorage.setItem("cv_user", JSON.stringify(res.data.data));
      return res.data;
    }
    throw new Error(res.data.message || "Registration failed");
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (e) {
      // ignore network errors on logout
    }
    setToken(null);
    setUser(defaultDummyUser);
    localStorage.removeItem("cv_token");
    localStorage.removeItem("cv_user");
  };

  const updateUser = (updatedUserData) => {
    const merged = { ...user, ...updatedUserData };
    setUser(merged);
    localStorage.setItem("cv_user", JSON.stringify(merged));
  };

  const refreshUser = async () => {
    try {
      const res = await API.get("/auth/me");
      if (res.data && res.data.data) {
        setUser(res.data.data);
        localStorage.setItem("cv_user", JSON.stringify(res.data.data));
      }
    } catch (e) {
      console.warn("Could not refresh user:", e.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token,
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
