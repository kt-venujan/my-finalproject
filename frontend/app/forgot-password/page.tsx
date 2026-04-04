"use client";

import Link from "next/link";
import { useState } from "react";
import type { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
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
      const response = await forgotPassword({ email });
      setMessage(
        response.message || "Reset password OTP has been sent to your email."
      );
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to send reset link"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="simple-auth-card">
        <form onSubmit={handleSubmit}>
          <div className="back-link-wrap">
            <Link href="/login">← Back</Link>
          </div>

          <h1>Forgot Password</h1>
          <p className="simple-auth-subtitle">
            Enter your email to receive an OTP verification code.
          </p>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {message && <p className="success-text">{message}</p>}
          {errorMessage && <p className="error-text">{errorMessage}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <div className="back-link-wrap">
            <Link href="/reset-password">Already have OTP? Reset password</Link>
          </div>

          <div className="back-link-wrap">
            <Link href="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}