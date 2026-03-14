"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenFromUrl = useMemo(
    () => searchParams.get("token") || "",
    [searchParams]
  );

  const emailFromUrl = useMemo(
    () => searchParams.get("email") || "",
    [searchParams]
  );

  const [email, setEmail] = useState(emailFromUrl);
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    try {
      setLoading(true);
      const response = await resetPassword({
        email,
        token,
        newPassword,
      });

      setMessage(response.message || "Password reset successful");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="simple-auth-card">
        <form onSubmit={handleSubmit}>
          <h1>Reset Password</h1>
          <p className="simple-auth-subtitle">
            Enter your email, token and new password.
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
            placeholder="Reset Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
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