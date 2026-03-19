"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "@/lib/axios";
import {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/types/auth";

type AuthContextType = {
  user: User | null;
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (data: LoginInput) => Promise<User>;
  register: (data: RegisterInput) => Promise<User>;
  forgotPassword: (data: ForgotPasswordInput) => Promise<{ message: string }>;
  resetPassword: (data: ResetPasswordInput) => Promise<{ message: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  const login = async (data: LoginInput): Promise<User> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    setUser(response.data.user);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    closeLogin();
    return response.data.user;
  };

  const register = async (data: RegisterInput): Promise<User> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    setUser(response.data.user);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    closeLogin();
    return response.data.user;
  };

  const forgotPassword = async (
    data: ForgotPasswordInput
  ): Promise<{ message: string }> => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  };

  const resetPassword = async (
    data: ResetPasswordInput
  ): Promise<{ message: string }> => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoginOpen,
        openLogin,
        closeLogin,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}