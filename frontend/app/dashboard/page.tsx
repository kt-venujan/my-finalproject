"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h1>Dashboard</h1>
        <p>Welcome {user.username || "User"}</p>
        <p>Email: {user.email || "No email"}</p>
        <p>Role: {user.role || "user"}</p>
      </div>
    </div>
  );
}