"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation"; // ✅ ADD

const services = [
  { name: "AI Diet Assistant", href: "/ai-assistant" },
  { name: "Dietician Consultation", href: "/services#dietician" },
  { name: "Dietary Kitchen", href: "/services#kitchen" },
  { name: "Meal Tracking", href: "/meal-tracking" },
  { name: "Reminders", href: "/reminder" },
];

export default function Navbar() {
  const pathname = usePathname(); // ✅ GET CURRENT PATH

  // 🔥 HIDE NAVBAR IN ADMIN
  if (pathname.startsWith("/dashboard/admin")) {
    return null;
  }

  const [showServices, setShowServices] = useState(false);
  const { user, openLogin, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="navbar">

        {/* LOGO */}
        <Link href="/" className="navbar-brand">
          <Image
            src="/logo.png"
            alt="Dietara Logo"
            width={42}
            height={42}
            className="navbar-logo"
          />
          <span>Dietara</span>
        </Link>

        {/* NAV LINKS */}
        <nav className="navbar-links">
          <Link href="/">Home</Link>

          {/* SERVICES DROPDOWN */}
          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-dropdown-btn"
              onClick={() => setShowServices(!showServices)} // ✅ FIXED
            >
              Services
            </button>

            {showServices && (
              <div className="dropdown-menu">
                {services.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowServices(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/pricing">Pricing</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        {/* ACTION BUTTON */}
        <div className="navbar-actions">
          {user ? (
            <button
              type="button"
              className="login-btn"
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              className="login-btn"
              onClick={openLogin}
            >
              Login
            </button>
          )}
        </div>

      </div>
    </header>
  );
}