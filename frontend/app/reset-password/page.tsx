"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const emailFromUrl = useMemo(
    () => searchParams.get("email") || "",
    [searchParams]
  );

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError?.response?.data?.message || fallback;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    try {
      setLoading(true);
      const response = await resetPassword({
        email,
        otp,
        newPassword,
      });

      setMessage(response.message || "Password reset successful");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to reset password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="simple-auth-card">
        <form onSubmit={handleSubmit}>
          <div className="back-link-wrap">
            <Link href="/forgot-password">← Back</Link>
          </div>

          <h1>Reset Password</h1>
          <p className="simple-auth-subtitle">
            Enter your email, OTP and new password.
          </p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="OTP Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          {message && <p className="success-text">{message}</p>}
          {errorMessage && <p className="error-text">{errorMessage}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="back-link-wrap">
            <Link href="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}