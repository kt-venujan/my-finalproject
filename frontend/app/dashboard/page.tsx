"use client";

export default function DashboardPage() {
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h1>Dashboard</h1>
        <p>Welcome {storedUser?.username || "User"}</p>
        <p>Email: {storedUser?.email || "-"}</p>
        <p>Role: {storedUser?.role || "-"}</p>
      </div>
    </div>
  );
}