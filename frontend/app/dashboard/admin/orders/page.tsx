"use client";

import AdminSidebar from "@/components/AdminSidebar";
import "../admin.css";

export default function OrdersPage() {
  return (
    <div className="layout">
      <AdminSidebar />

      <div className="main">
        <h2>Orders 📦</h2>
      </div>
    </div>
  );
}