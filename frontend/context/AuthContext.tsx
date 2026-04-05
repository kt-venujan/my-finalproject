"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
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
  refreshMe: () => Promise<User | null>;
  setAuthUser: (nextUser: User | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role?: string): User["role"] => {
  const value = String(role || "").trim().toLowerCase();
  if (value === "customer") return "user";
  if (value === "dietitian") return "dietician";
  if (value === "admin" || value === "kitchen" || value === "dietician") {
    return value;
  }
  return "user";
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const setAuthUser = (nextUser: User | null) => {
    const normalizedUser = nextUser
      ? { ...nextUser, role: normalizeRole(nextUser.role) }
      : null;

    setUser(normalizedUser);

    if (normalizedUser) {
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  const refreshMe = async (): Promise<User | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const response = await api.get("/auth/me");
      const nextUser = response.data?.user as User;
      if (nextUser) {
        setAuthUser(nextUser);
        return nextUser;
      }
      return null;
    } catch {
      return null;
    }
  };

  // 🔥 Load user
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setUser({ ...parsedUser, role: normalizeRole(parsedUser.role) });
      } catch {
        localStorage.removeItem("user");
      }
    }

    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  // ================= LOGIN =================
  const login = async (data: LoginInput): Promise<User> => {
    const response = await api.post<AuthResponse>("/auth/login", data);

    const loggedInUser = response.data.user;

    // save
    setAuthUser(loggedInUser);
    localStorage.setItem("token", response.data.token);

    closeLogin();

    // 🔥 IMPORTANT: use window.location (force redirect)
    const role = normalizeRole(loggedInUser.role);

    if (role === "admin") {
      window.location.href = "/dashboard/admin";
    } else if (role === "dietician") {
      window.location.href = "/dashboard/dietician";
    } else if (role === "kitchen") {
      window.location.href = "/dashboard/kitchen";
    } else {
      window.location.href = "/dashboard/user";
    }

    return loggedInUser;
  };

  // ================= REGISTER =================
  const register = async (data: RegisterInput): Promise<User> => {
    const response = await api.post<AuthResponse>("/auth/register", data);

    const registeredUser = response.data.user;

    setAuthUser(registeredUser);
    localStorage.setItem("token", response.data.token);

    closeLogin();

    const role = normalizeRole(registeredUser.role);

    if (role === "admin") {
      window.location.href = "/dashboard/admin";
    } else if (role === "dietician") {
      window.location.href = "/dashboard/dietician";
    } else if (role === "kitchen") {
      window.location.href = "/dashboard/kitchen";
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
    setAuthUser(null);
    setIsLoginOpen(false);

    localStorage.removeItem("token");

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
        refreshMe,
        setAuthUser,
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