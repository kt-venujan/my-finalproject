"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // 🔥 Load user
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  // ================= LOGIN =================
  const login = async (data: LoginInput): Promise<User> => {
    const response = await api.post<AuthResponse>("/auth/login", data);

    const loggedInUser = response.data.user;

    // save
    setUser(loggedInUser);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    closeLogin();

    // 🔥 IMPORTANT: use window.location (force redirect)
    const role = loggedInUser.role;

    if (role === "admin") {
      window.location.href = "/dashboard/admin";
    } else if (role === "dietician") {
      window.location.href = "/dashboard/dietician";
    } else {
      window.location.href = "/dashboard/user";
    }

    return loggedInUser;
  };

  // ================= REGISTER =================
  const register = async (data: RegisterInput): Promise<User> => {
    const response = await api.post<AuthResponse>("/auth/register", data);

    const registeredUser = response.data.user;

    setUser(registeredUser);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(registeredUser));

    closeLogin();

    const role = registeredUser.role;

    if (role === "admin") {
      window.location.href = "/dashboard/admin";
    } else if (role === "dietician") {
      window.location.href = "/dashboard/dietician";
    } else {
      window.location.href = "/dashboard/user";
    }

    return registeredUser;
  };

  // ================= FORGOT PASSWORD =================
  const forgotPassword = async (
    data: ForgotPasswordInput
  ): Promise<{ message: string }> => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  };

  // ================= RESET PASSWORD =================
  const resetPassword = async (
    data: ResetPasswordInput
  ): Promise<{ message: string }> => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  };

  // ================= LOGOUT =================
  const logout = () => {
    setUser(null);
    setIsLoginOpen(false);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
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

// ================= HOOK =================
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}