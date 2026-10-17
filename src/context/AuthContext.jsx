import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("proctor_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("proctor_token") || null);
  const [loading, setLoading] = useState(true);

  // Check current auth session on initial load
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem("proctor_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        if (data?.data?.user) {
          setUser(data.data.user);
          localStorage.setItem("proctor_user", JSON.stringify(data.data.user));
        }
      } catch (err) {
        console.warn("Session expired or invalid, logging out.");
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const { user: loggedInUser, token: authToken } = data.data;

    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem("proctor_user", JSON.stringify(loggedInUser));
    localStorage.setItem("proctor_token", authToken);

    return loggedInUser;
  };

  const register = async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    const { user: registeredUser, token: authToken } = data.data;

    setUser(registeredUser);
    setToken(authToken);
    localStorage.setItem("proctor_user", JSON.stringify(registeredUser));
    localStorage.setItem("proctor_token", authToken);

    return registeredUser;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("proctor_user");
    localStorage.removeItem("proctor_token");
  };

  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const isStudent = user?.role === "student";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isTeacher,
        isStudent,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
