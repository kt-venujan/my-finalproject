"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoginInput, RegisterInput } from "@/types/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AuthCard() {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState<RegisterInput>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { login, register } = useAuth();
  const router = useRouter();

  const goDashboard = () => {
    router.replace("/dashboard");
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    setSuccessMessage("");

    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    setSuccessMessage("");

    setRegisterData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!loginData.email.trim()) {
      setErrorMessage("Please enter your email");
      return;
    }

    if (!loginData.password.trim()) {
      setErrorMessage("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      await login(loginData);

      setSuccessMessage("Login successful ✅");
      goDashboard();
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message?.toLowerCase?.() || "";

      if (
        error?.response?.status === 404 ||
        backendMessage.includes("email") ||
        backendMessage.includes("user not found")
      ) {
        setErrorMessage("Wrong email");
      } else if (
        error?.response?.status === 401 ||
        backendMessage.includes("password") ||
        backendMessage.includes("invalid")
      ) {
        setErrorMessage("Invalid password");
      } else {
        setErrorMessage(error?.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const passwordRegex = /^(?=.*[0-9]).{8,}$/;

    if (!passwordRegex.test(registerData.password)) {
      setErrorMessage("Password must contain at least 8 characters and a number");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await register(registerData);

      setSuccessMessage("Registration successful ✅");
      goDashboard();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${isActive ? "active" : ""}`}>
      {/* REGISTER */}
      <div className="form-container sign-up">
        <form onSubmit={handleRegisterSubmit}>
          <h1>Registration</h1>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={registerData.username}
            onChange={handleRegisterChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={registerData.email}
            onChange={handleRegisterChange}
            required
          />

          <div className="password-input-wrap">
            <input
              type={showRegisterPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
            />

            <span
              className="password-eye"
              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
            >
              {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <p className="password-rule">
            Password must contain at least 8 characters and a number
          </p>

          <div className="password-input-wrap">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              required
            />

            <span
              className="password-eye"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {errorMessage && isActive && (
            <p className="error-text">{errorMessage}</p>
          )}

          {successMessage && isActive && (
            <p className="success-text">{successMessage}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Register"}
          </button>
        </form>
      </div>

      {/* LOGIN */}
      <div className="form-container sign-in">
        <form onSubmit={handleLoginSubmit}>
          <h1>Login</h1>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={loginData.email}
            onChange={handleLoginChange}
            required
          />

          <div className="password-input-wrap">
            <input
              type={showLoginPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />

            <span
              className="password-eye"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
            >
              {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <Link href="/forgot-password">Forgot Password?</Link>

          {errorMessage && !isActive && (
            <p className="error-text">{errorMessage}</p>
          )}

          {successMessage && !isActive && (
            <p className="success-text">{successMessage}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>
      </div>

      {/* TOGGLE */}
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don&apos;t have an account?</p>

            <button
              type="button"
              className="hidden"
              onClick={() => {
                setIsActive(false);
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              Login
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>

            <button
              type="button"
              className="hidden"
              onClick={() => {
                setIsActive(true);
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}