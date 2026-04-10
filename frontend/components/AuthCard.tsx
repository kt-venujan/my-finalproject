"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoginInput, RegisterInput } from "@/types/auth";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import api from "@/lib/axios";

type ResetStep = "request" | "verify" | "reset";

export default function AuthCard() {
  const searchParams = useSearchParams();
  const oauthStatus = searchParams.get("oauth");
  const oauthReason = searchParams.get("reason");
  const oauthToastShown = useRef(false);
  const initialRoleParam = (searchParams.get("role") || "").toLowerCase();
  const initialRole: RegisterInput["role"] =
    initialRoleParam === "dietician" || initialRoleParam === "dietitian"
      ? "dietician"
      : initialRoleParam === "admin"
        ? "admin"
      : initialRoleParam === "kitchen"
        ? "kitchen"
        : "user";

  const startInRegister = Boolean(searchParams.get("role"));
  const [isActive, setIsActive] = useState(startInRegister);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [showResetFlow, setShowResetFlow] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>("request");

  const [loginData, setLoginData] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const [resetData, setResetData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [registerData, setRegisterData] = useState<RegisterInput>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialRole,
  });

  const { login, register, forgotPassword, resetPassword } = useAuth();

  const googleAuthUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  const googleCallbackUrl = `${googleAuthUrl.replace(/\/+$/, "")}/auth/google/callback`;

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError?.response?.data?.message || fallback;
  };

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  useEffect(() => {
    if (oauthStatus !== "failed" || oauthToastShown.current) {
      return;
    }

    oauthToastShown.current = true;
    setIsActive(false);
    setShowResetFlow(false);

    let message =
      `Google sign-in failed. Add this redirect URI in Google Cloud: ${googleCallbackUrl}`;
    let toastMessage = "Google sign-in failed";

    if (oauthReason === "invalid_client_secret" || oauthReason === "invalid_client") {
      message =
        "Google client secret is invalid. Update GOOGLE_CLIENT_SECRET in Backend/.env with the secret from the same OAuth client ID.";
      toastMessage = "Google sign-in failed (invalid client secret)";
    } else if (oauthReason === "redirect_uri_mismatch") {
      message =
        `Redirect URI mismatch. Add this exact URI in Google Cloud: ${googleCallbackUrl}`;
      toastMessage = "Google sign-in failed (redirect URI mismatch)";
    } else if (oauthReason === "oauth_denied") {
      message = "Google sign-in was canceled. Please try again.";
      toastMessage = "Google sign-in canceled";
    }

    setErrorMessage(message);
    toast.error(toastMessage);
  }, [googleCallbackUrl, oauthReason, oauthStatus]);

  const openResetFlow = (prefillEmail = "") => {
    setShowResetFlow(true);
    setResetStep("request");
    setResetData({
      email: prefillEmail || loginData.email || registerData.email || "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    clearMessages();
  };

  const closeResetFlow = () => {
    setShowResetFlow(false);
    setResetStep("request");
    setShowResetPassword(false);
    setShowResetConfirmPassword(false);
    clearMessages();
    setIsActive(false);
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();

    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    clearMessages();

    setRegisterData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    setResetData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();

    if (!loginData.email.trim()) {
      setErrorMessage("Please enter your email");
      toast.error("Please enter your email");
      return;
    }

    if (!loginData.password.trim()) {
      setErrorMessage("Please enter your password");
      toast.error("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      await login(loginData);

      setSuccessMessage("Login successful ✅");
      toast.success("Login successful ✅");
    } catch (error: unknown) {
      const backendMessage = getApiErrorMessage(error, "").toLowerCase();
      const axiosError = error as AxiosError<{ message?: string }>;

      if (
        axiosError?.response?.status === 404 ||
        backendMessage.includes("email") ||
        backendMessage.includes("user not found")
      ) {
        setErrorMessage("Wrong email");
        toast.error("Wrong email");
      } else if (
        axiosError?.response?.status === 401 ||
        backendMessage.includes("password") ||
        backendMessage.includes("invalid")
      ) {
        setErrorMessage("Invalid password");
        toast.error("Invalid password");
      } else {
        const message = getApiErrorMessage(error, "Login failed");
        setErrorMessage(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();

    const passwordRegex = /^(?=.*[0-9]).{8,}$/;

    if (!passwordRegex.test(registerData.password)) {
      const message = "Password must contain at least 8 characters and a number";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await register(registerData);

      setSuccessMessage("Registration successful ✅");
      toast.success("Registration successful ✅");
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Registration failed");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    const email = resetData.email.trim();
    if (!email) {
      setErrorMessage("Please enter your email");
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPassword({ email });
      const message = res?.message || "OTP sent to your email";
      setSuccessMessage(message);
      toast.success(message);
      setResetStep("verify");
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to send OTP");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = resetData.email.trim();
    const otp = resetData.otp.trim();

    if (!email || !otp) {
      setErrorMessage("Email and OTP are required");
      toast.error("Email and OTP are required");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/verify-reset-otp", { email, otp });
      setSuccessMessage("OTP verified. Set your new password.");
      toast.success("OTP verified ✅");
      setResetStep("reset");
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Invalid or expired OTP");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    const passwordRegex = /^(?=.*[0-9]).{8,}$/;
    const email = resetData.email.trim();
    const otp = resetData.otp.trim();

    if (!email || !otp) {
      setErrorMessage("Email and OTP are required");
      toast.error("Email and OTP are required");
      return;
    }

    if (!passwordRegex.test(resetData.newPassword)) {
      const message = "Password must contain at least 8 characters and a number";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword({
        email,
        otp,
        newPassword: resetData.newPassword,
      });

      const message = res?.message || "Password reset successful";
      setSuccessMessage(message);
      toast.success(message);

      setLoginData((prev) => ({
        ...prev,
        email,
        password: "",
      }));

      setShowResetFlow(false);
      setResetStep("request");
      setIsActive(false);
      setResetData({
        email,
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to reset password");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();

    if (resetStep === "request") {
      await handleRequestOtp();
      return;
    }

    if (resetStep === "verify") {
      await handleVerifyOtp();
      return;
    }

    await handleResetPasswordSubmit();
  };

  const handleGoogleSignIn = () => {
    const origin = window.location.origin;
    window.location.href = `${googleAuthUrl}/auth/google?origin=${encodeURIComponent(origin)}`;
  };

  return (
    <div className={`auth-card-container ${isActive ? "active" : ""} ${showResetFlow ? "reset-mode" : ""}`}>
      {showResetFlow ? (
        <div className="form-container sign-in">
          <form onSubmit={handleResetSubmit}>
            <h1>Reset Password</h1>
            <p className="auth-reset-subtitle">
              Complete OTP verification and set your new password without leaving this screen.
            </p>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={resetData.email}
              onChange={handleResetChange}
              required
            />

            {(resetStep === "verify" || resetStep === "reset") && (
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={resetData.otp}
                onChange={handleResetChange}
                required
              />
            )}

            {resetStep === "reset" && (
              <>
                <div className="password-input-wrap">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="New Password"
                    value={resetData.newPassword}
                    onChange={handleResetChange}
                    autoComplete="new-password"
                    required
                  />

                  <span
                    className="password-eye"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                  >
                    {showResetPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <p className="password-rule">
                  Password must contain at least 8 characters and a number
                </p>

                <div className="password-input-wrap">
                  <input
                    type={showResetConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={resetData.confirmPassword}
                    onChange={handleResetChange}
                    autoComplete="new-password"
                    required
                  />

                  <span
                    className="password-eye"
                    onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                  >
                    {showResetConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </>
            )}

            {errorMessage && <p className="error-text">{errorMessage}</p>}
            {successMessage && <p className="success-text">{successMessage}</p>}

            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : resetStep === "request"
                  ? "Send OTP"
                  : resetStep === "verify"
                    ? "Verify OTP"
                    : "Reset Password"}
            </button>

            <span
              className="auth-inline-link-text"
              role="button"
              tabIndex={0}
              onClick={closeResetFlow}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  closeResetFlow();
                }
              }}
            >
              Back to Login
            </span>
          </form>
        </div>
      ) : (
        <>
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

              <select
                name="role"
                value={registerData.role}
                onChange={handleRegisterChange}
                className="role-select"
                required
              >
                <option value="user">Register as User</option>
                <option value="dietician">Register as Dietician</option>
                <option value="kitchen">Register as Kitchen Staff</option>
                <option value="admin">Register as Admin</option>
              </select>

              <div className="password-input-wrap">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  autoComplete="new-password"
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
                  autoComplete="new-password"
                  required
                />

                <span
                  className="password-eye"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <span
                className="auth-inline-link-text"
                role="button"
                tabIndex={0}
                onClick={() => openResetFlow(registerData.email)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openResetFlow(registerData.email);
                  }
                }}
              >
                Forgot password? Reset with OTP
              </span>

              {errorMessage && isActive && (
                <p className="error-text">{errorMessage}</p>
              )}

              {successMessage && isActive && (
                <p className="success-text">{successMessage}</p>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "Please wait..." : "Register"}
              </button>

              <div className="auth-social-actions">
                <div className="auth-divider">or</div>

                <button
                  type="button"
                  className="google-auth-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <FaGoogle aria-hidden="true" />
                  Continue with Google
                </button>
              </div>
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
                  autoComplete="current-password"
                  required
                />

                <span
                  className="password-eye"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <span
                className="auth-inline-link-text"
                role="button"
                tabIndex={0}
                onClick={() => openResetFlow(loginData.email)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openResetFlow(loginData.email);
                  }
                }}
              >
                Forgot Password? Use OTP
              </span>

              {errorMessage && !isActive && (
                <p className="error-text">{errorMessage}</p>
              )}

              {successMessage && !isActive && (
                <p className="success-text">{successMessage}</p>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "Please wait..." : "Login"}
              </button>

              <div className="auth-social-actions">
                <div className="auth-divider">or</div>

                <button
                  type="button"
                  className="google-auth-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <FaGoogle aria-hidden="true" />
                  Continue with Google
                </button>
              </div>
            </form>
          </div>

          {/* TOGGLE */}
          <div className="toggle-container">
            <div className="toggle">
              <div className="toggle-panel toggle-left">
                <h1>Welcome Back!</h1>
                <p>Already have an account?</p>

                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setIsActive(false);
                    clearMessages();
                  }}
                >
                  Login
                </button>
              </div>

              <div className="toggle-panel toggle-right">
                <h1>Hello, Welcome!</h1>
                <p>Don&apos;t have an account?</p>

                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setIsActive(true);
                    clearMessages();
                  }}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}