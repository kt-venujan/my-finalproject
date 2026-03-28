"use client";

import { useRouter, usePathname } from "next/navigation";

export default function AdminSidebar() {
  const router = useRouter();
  const path = usePathname();

  const menu = [
    { name: "Dashboard", path: "/dashboard/admin" },
    { name: "Food Management", path: "/dashboard/admin/food" },
    { name: "Orders", path: "/dashboard/admin/orders" },
    { name: "Dieticians", path: "/dashboard/admin/dieticians" },
    { name: "Analytics", path: "/dashboard/admin/analytics" },
  ];

  const system = [
    { name: "Notifications", path: "/dashboard/admin/notifications" },
    { name: "Settings", path: "/dashboard/admin/settings" },
  ];

  return (
    <div className="sidebar">
      <h2 className="logo">SmartDiet Hub</h2>

      <p className="menu-title">MAIN MENU</p>
      <ul>
        {menu.map((item) => (
          <li
            key={item.name}
            className={path === item.path ? "active" : ""}
            onClick={() => router.push(item.path)}
          >
            {item.name}
          </li>
        ))}
      </ul>

      <p className="menu-title">SYSTEM</p>
      <ul>
        {system.map((item) => (
          <li
            key={item.name}
            className={path === item.path ? "active" : ""}
            onClick={() => router.push(item.path)}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}