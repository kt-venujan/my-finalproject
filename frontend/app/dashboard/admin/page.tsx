"use client";

import AdminSidebar from "@/components/AdminSidebar";

import "../admin.css";

export default function AdminDashboard() {
  return (
    <div className="layout">
      <AdminSidebar />

      <div className="main">
        <h2>Admin Dashboard </h2>
        {/* your cards, analytics etc */}
      </div>
    </div>
  );
}