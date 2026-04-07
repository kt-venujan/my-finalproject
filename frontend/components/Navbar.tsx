"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation"; // ✅ ADD
import { resolveBackendAssetUrl } from "@/lib/assetUrl";
import { FiBell } from "react-icons/fi";
import api from "@/lib/axios";

type BookingActivity = {
  _id: string;
  status?: string;
  paymentStatus?: string;
  dieticianApproved?: boolean;
  createdAt?: string;
  date?: string;
};

type KitchenOrderActivity = {
  _id: string;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
};

type UserAction = {
  id: string;
  message: string;
  timestamp: number;
  timeLabel: string;
};

const services = [
  { name: "AI Diet Assistant", href: "/ai-assistant" },
  { name: "Dietician Consultation", href: "/dietician" },
  { name: "Dietary Kitchen", href: "/kitchen" },
  { name: "Meal Tracking", href: "/meal-tracking" },
  { name: "Reminders", href: "/reminder" },
];

export default function Navbar() {
  const pathname = usePathname(); // ✅ GET CURRENT PATH
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isPaymentSuccessRoute = pathname === "/payment/success";
  const [showServices, setShowServices] = useState(false);
  const servicesCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const { user, openLogin } = useAuth();

  const avatarSrc = resolveBackendAssetUrl(user?.avatar) || "/aval.jpg";

  const toTimestamp = (...values: Array<string | undefined>) => {
    for (const value of values) {
      if (!value) continue;
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return Date.now();
  };

  const toTimeLabel = (timestamp: number) => {
    return new Date(timestamp).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearServicesCloseTimer = () => {
    if (servicesCloseTimerRef.current) {
      clearTimeout(servicesCloseTimerRef.current);
      servicesCloseTimerRef.current = null;
    }
  };

  const openServicesMenu = () => {
    clearServicesCloseTimer();
    setShowServices(true);
  };

  const closeServicesMenu = (delay = 0) => {
    clearServicesCloseTimer();

    if (delay <= 0) {
      setShowServices(false);
      return;
    }

    servicesCloseTimerRef.current = setTimeout(() => {
      setShowServices(false);
      servicesCloseTimerRef.current = null;
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (servicesCloseTimerRef.current) {
        clearTimeout(servicesCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user || user.role !== "user") {
      setUserActions([]);
      return;
    }

    const loadActions = async () => {
      try {
        setNotificationsLoading(true);

        const [ordersResult, bookingsResult] = await Promise.allSettled([
          api.get("/payments/orders/my"),
          api.get("/bookings/my"),
        ]);

        const orders: KitchenOrderActivity[] =
          ordersResult.status === "fulfilled" ? ordersResult.value.data || [] : [];
        const bookings: BookingActivity[] =
          bookingsResult.status === "fulfilled" ? bookingsResult.value.data || [] : [];

        const orderActions: UserAction[] = orders.map((order) => {
          const status = String(order.status || "pending");
          let message = "Order successfully placed";

          if (status === "delivered") message = "Order delivered successfully";
          else if (status === "cancelled") message = "Order was cancelled";
          else if (status !== "pending" && status !== "paid") {
            message = `Order is now ${status.replaceAll("_", " ")}`;
          }

          const timestamp = toTimestamp(order.createdAt);

          return {
            id: `order-${order._id}`,
            message,
            timestamp,
            timeLabel: toTimeLabel(timestamp),
          };
        });

        const bookingActions: UserAction[] = bookings.map((booking) => {
          let message = "Consultation booking submitted";

          if (booking.dieticianApproved) {
            message = "Consultation approved by dietician";
          } else if (String(booking.paymentStatus || "") === "paid") {
            message = "Consultation payment successful";
          }

          const timestamp = toTimestamp(booking.createdAt, booking.date);

          return {
            id: `booking-${booking._id}`,
            message,
            timestamp,
            timeLabel: toTimeLabel(timestamp),
          };
        });

        const recent = [...orderActions, ...bookingActions]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5);

        setUserActions(recent);
      } catch (error) {
        console.error("Failed to load notifications", error);
        setUserActions([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadActions();
  }, [user]);

  const getDashboardHref = () => {
    if (!user) return "/dashboard";

    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "dietician") return "/dashboard/dietician";
    if (user.role === "kitchen") return "/dashboard/kitchen";

    return "/dashboard/user";
  };

  if (isDashboardRoute || isPaymentSuccessRoute) {
    return null;
  }

  return (
    <header className="site-header">
      <div className="navbar">

        {/* LOGO */}
        <Link href="/" className="navbar-brand">
          <Image
            src="/logo.png"
            alt="Dietara Logo"
            width={50}
            height={50}
            className="navbar-logo"
          />
          <span>Dietara</span>
        </Link>

        {/* NAV LINKS */}
        <nav className="navbar-links">
          <Link href="/">Home</Link>

          {/* SERVICES DROPDOWN */}
          <div
            className="nav-dropdown"
            onMouseEnter={openServicesMenu}
            onMouseLeave={() => closeServicesMenu(180)}
            onFocus={openServicesMenu}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                closeServicesMenu();
              }
            }}
          >
            <button
              type="button"
              className="nav-dropdown-btn"
              aria-expanded={showServices}
              onClick={() => {
                clearServicesCloseTimer();
                setShowServices((prev) => !prev);
              }}
            >
              Services
            </button>

            {showServices && (
              <div
                className="dropdown-menu"
                onMouseEnter={openServicesMenu}
                onMouseLeave={() => closeServicesMenu(180)}
              >
                {services.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => closeServicesMenu()}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/pricing">Pricing</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        {/* ACTION BUTTON */}
        <div className="navbar-actions">
          {user ? (
            <>
              <div className="group relative">
                <button
                  type="button"
                  className="relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#e6d6dc] bg-white text-[#8b0c2e] text-[18px] transition duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_18px_rgba(139,12,46,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9899b]/50"
                  aria-label="User notifications"
                >
                  <FiBell />
                  {user.role === "user" && userActions.length > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#8b0c2e] px-1 text-[11px] font-bold text-white">
                      {userActions.length}
                    </span>
                  )}
                </button>

                <div className="pointer-events-none invisible absolute right-0 top-[52px] z-[1100] w-[min(340px,calc(100vw-28px))] translate-y-1 scale-[0.98] rounded-2xl border border-[#f0dce2] bg-white p-3 opacity-0 shadow-[0_16px_40px_rgba(15,23,42,0.16)] transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100">
                  <p className="mb-2.5 text-sm font-bold text-[#8b0c2e]">Recent Activity</p>

                  {notificationsLoading ? (
                    <p className="px-0.5 py-2 text-[13px] text-slate-500">Loading actions...</p>
                  ) : user.role !== "user" ? (
                    <p className="px-0.5 py-2 text-[13px] text-slate-500">No recent user actions.</p>
                  ) : userActions.length === 0 ? (
                    <p className="px-0.5 py-2 text-[13px] text-slate-500">No recent actions yet.</p>
                  ) : (
                    <ul className="grid max-h-[280px] list-none gap-2 overflow-y-auto p-0">
                      {userActions.map((action) => (
                        <li
                          key={action.id}
                          className="rounded-xl border border-[#f5dfe6] bg-[#fff7f9] p-2.5"
                        >
                          <p className="m-0 text-[13px] leading-[1.4] text-gray-800">
                            {action.message}
                          </p>
                          <span className="mt-1 inline-block text-xs text-slate-500">
                            {action.timeLabel}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <Link
                href={getDashboardHref()}
                className="avatar-link"
                title="Account"
                aria-label="Go to dashboard"
              >
                <Image
                  src={avatarSrc}
                  alt={user.username || "Account"}
                  width={40}
                  height={40}
                  className="avatar-img"
                />
              </Link>
            </>
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