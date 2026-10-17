import React, { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  verifySession,
  loginUser,
  registerUser,
  logoutUser,
} from "../store/slices/authSlice.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector((state) => state.auth);

  // Check current auth session on initial load via Redux
  useEffect(() => {
    dispatch(verifySession());
  }, [dispatch]);

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password })).unwrap();
    return result.user;
  };

  const register = async (userData) => {
    const result = await dispatch(registerUser(userData)).unwrap();
    return result.user;
  };

  const logout = async () => {
    await dispatch(logoutUser());
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
