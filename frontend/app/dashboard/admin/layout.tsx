"use client";

import type { ReactNode } from "react";
import { FormEvent, useMemo, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { useRouter } from "next/navigation";
import { FiBell, FiSearch } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import "./admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const searchableRoutes = useMemo(
    () => [
      { path: "/dashboard/admin", keys: ["dashboard", "overview", "home"] },
      {
        path: "/dashboard/admin/food",
        keys: ["food", "menu", "category", "products"],
      },
      {
        path: "/dashboard/admin/bundles",
        keys: ["bundle", "offers", "discount", "weekly", "monthly"],
      },
      {
        path: "/dashboard/admin/orders",
        keys: ["orders", "kitchen", "bookings", "delivery"],
      },
      {
        path: "/dashboard/admin/dieticians",
        keys: ["dieticians", "certificates", "verification"],
      },
      {
        path: "/dashboard/admin/users",
        keys: ["users", "roles", "management", "accounts"],
      },
      {
        path: "/dashboard/admin/analytics",
        keys: ["analytics", "metrics", "reports", "stats"],
      },
      {
        path: "/dashboard/admin/notifications",
        keys: ["notifications", "alerts"],
      },
    ],
    []
  );

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = search.trim().toLowerCase();
    if (!query) return;

    const match = searchableRoutes.find((item) =>
      item.keys.some((key) => key.includes(query) || query.includes(key))
    );

    if (match) {
      router.push(match.path);
    }
  };

  return (
    <div className="adm-layout-shell">
      <AdminSidebar />
      <main className="adm-main-shell">
        <header className="adm-topbar">
          <form className="adm-topbar-search" onSubmit={handleSearch}>
            <FiSearch className="adm-topbar-search-icon" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search admin sections"
            />
          </form>

          <div className="adm-topbar-actions">
            <button
              type="button"
              className="adm-topbar-notify"
              onClick={() => router.push("/dashboard/admin/notifications")}
              aria-label="Open notifications"
            >
              <FiBell />
            </button>

            <div className="adm-topbar-avatar" title={user?.username || "Admin"}>
              {user?.username?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
