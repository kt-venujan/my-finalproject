"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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

  return (
    <header className="site-header">
      <div className="navbar">
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

        <nav className="navbar-links">
          <Link href="/">Home</Link>

          <div className="nav-dropdown">
            <button
              className="nav-dropdown-btn"
              type="button"
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

          <div className="nav-dropdown">
            <button
              className="nav-dropdown-btn"
              type="button"
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

        <div className="navbar-actions">
          <Link href="/login" className="login-btn">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}