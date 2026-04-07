"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

const getPostAuthRedirectPath = (role?: string) => {
  if (String(role || "").trim().toLowerCase() === "admin") {
    return "/dashboard/admin";
  }

  return "/";
};

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);
  const { refreshMe, setAuthUser } = useAuth();

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get("token");

    if (!token) {
      toast.error("Google sign-in failed");
      router.replace("/login?oauth=failed");
      return;
    }

    localStorage.setItem("token", token);

    const completeAuth = async () => {
      try {
        const user = await refreshMe();

        if (!user) {
          throw new Error("Unable to load user profile");
        }

        setAuthUser(user);
        toast.success("Google sign-in successful ✅");
        router.replace(getPostAuthRedirectPath(user.role));
      } catch {
        localStorage.removeItem("token");
        setAuthUser(null);
        toast.error("Google sign-in failed");
        router.replace("/login?oauth=failed");
      }
    };

    void completeAuth();
  }, [refreshMe, router, searchParams, setAuthUser]);

  return (
    <div className="auth-page">
      <p style={{ color: "#4b5563", fontWeight: 500 }}>Signing you in with Google...</p>
    </div>
  );
}
