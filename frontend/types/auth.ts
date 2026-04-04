export type Role = "user" | "dietician" | "kitchen" | "admin";

export type User = {
  id: string;
  username: string;
  email: string;
  role: Role;
};

export type AuthResponse = {
  success: boolean;
  token: string;
  user: User;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  email: string;
  token: string;
  newPassword: string;
};