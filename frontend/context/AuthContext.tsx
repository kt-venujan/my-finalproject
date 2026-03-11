"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import api from "@/lib/axios";
import {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from "@/types/auth";

type AuthContextType = {
  user: User | null;
  login: (data: LoginInput) => Promise<User>;
  register: (data: RegisterInput) => Promise<User>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (data: LoginInput): Promise<User> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    setUser(response.data.user);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data.user;
  };

  const register = async (data: RegisterInput): Promise<User> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    setUser(response.data.user);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, login, register }}>
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