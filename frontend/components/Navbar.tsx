"use client";

import Image from "next/image"; // ✅ IMPORTANT
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const services = [
  { name: "AI Diet Assistant", href: "/ai-assistant" },
  { name: "Dietician Consultation", href: "/services#dietician" },
  { name: "Dietary Kitchen", href: "/services#kitchen" },
  { name: "Meal Tracking", href: "/services#tracking" },
  { name: "Reminders", href: "/services#reminders" },
];

const dashboards = [
  { name: "User Dashboard", href: "/dashboard#user" },
  { name: "Dietician Dashboard", href: "/dashboard#dietician" },
  { name: "Kitchen Dashboard", href: "/dashboard#kitchen" },
  { name: "Admin Dashboard", href: "/dashboard#admin" },
];

export default function Navbar() {
  const [showServices, setShowServices] = useState(false);
  const [showDashboards, setShowDashboards] = useState(false);

  const { openLogin } = useAuth();

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

          {/* SERVICES */}
          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-dropdown-btn"
              onClick={() => {
                setShowServices(!showServices);
                setShowDashboards(false);
              }}
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

          {/* DASHBOARDS */}
          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-dropdown-btn"
              onClick={() => {
                setShowDashboards(!showDashboards);
                setShowServices(false);
              }}
            >
              Dashboards
            </button>

            {showDashboards && (
              <div className="dropdown-menu">
                {dashboards.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowDashboards(false)}
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

        {/* LOGIN BUTTON */}
        <div className="navbar-actions">
          <button
            type="button"
            className="login-btn"
            onClick={openLogin}
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}