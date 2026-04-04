"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiArrowLeft,
  FiBarChart2,
  FiCoffee,
  FiGift,
  FiGrid,
  FiLogOut,
  FiPackage,
  FiShield,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

export default function AdminSidebar() {
  const path = usePathname();
  const { user, logout } = useAuth();

  const menu = [
    { name: "Dashboard", path: "/dashboard/admin", icon: <FiGrid /> },
    {
      name: "Food Management",
      path: "/dashboard/admin/food",
      icon: <FiCoffee />,
    },
    {
      name: "Bundle Offers",
      path: "/dashboard/admin/bundles",
      icon: <FiGift />,
    },
    { name: "Orders", path: "/dashboard/admin/orders", icon: <FiPackage /> },
    {
      name: "Dieticians",
      path: "/dashboard/admin/dieticians",
      icon: <FiUserCheck />,
    },
    {
      name: "User Management",
      path: "/dashboard/admin/users",
      icon: <FiUsers />,
    },
    {
      name: "Analytics",
      path: "/dashboard/admin/analytics",
      icon: <FiBarChart2 />,
    },
    {
      name: "Notifications",
      path: "/dashboard/admin/notifications",
      icon: <FiShield />,
    },
  ];

  return (
    <aside className="adm-sidebar">
      <Link href="/" className="adm-home-link" aria-label="Back to home">
        <FiArrowLeft />
        <span>Home</span>
      </Link>

      <div className="adm-brand">
        <h2>SmartDiet Hub</h2>
        <p>Admin Console</p>
      </div>

      <p className="adm-menu-title">MAIN MENU</p>
      <ul className="adm-nav-list">
        {menu.map((item) => (
          <li
            key={item.name}
            className={path === item.path ? "active" : ""}
          >
            <Link href={item.path} className="adm-nav-link">
              <span className="adm-nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="adm-sidebar-footer">
        <p className="adm-sidebar-user">{user?.username || "Admin"}</p>
        <button type="button" className="adm-logout-btn" onClick={logout}>
          <FiLogOut />
          Logout
        </button>
        <div className="adm-sidebar-links">
          <a href="#">Help</a>
          <a href="#">Terms</a>
        </div>
        <p className="adm-sidebar-copy">Copyright 2026</p>
      </div>
    </aside>
  );
}