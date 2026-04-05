"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import {
  FiCoffee,
  FiCreditCard,
  FiPackage,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

type KitchenOrder = {
  _id: string;
  subtotal: number;
  paymentStatus: "pending" | "paid" | "failed";
};

type Booking = {
  _id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

type DashboardSummary = {
  orders: number;
  bookings: number;
  foods: number;
  users: number;
  paidRevenue: number;
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    orders: 0,
    bookings: 0,
    foods: 0,
    users: 0,
    paidRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [ordersRes, bookingsRes, foodsRes, usersRes] = await Promise.allSettled([
          api.get("/payments/orders/admin/all"),
          api.get("/bookings/admin/all"),
          api.get("/foods"),
          api.get("/admin/users"),
        ]);

        const orders: KitchenOrder[] =
          ordersRes.status === "fulfilled" ? ordersRes.value.data || [] : [];
        const bookings: Booking[] =
          bookingsRes.status === "fulfilled" ? bookingsRes.value.data || [] : [];
        const foodsCount =
          foodsRes.status === "fulfilled" ? (foodsRes.value.data || []).length : 0;
        const usersCount =
          usersRes.status === "fulfilled" ? (usersRes.value.data || []).length : 0;

        if (ordersRes.status === "rejected") {
          console.warn("Admin summary: failed to load orders", ordersRes.reason);
        }
        if (bookingsRes.status === "rejected") {
          console.warn("Admin summary: failed to load bookings", bookingsRes.reason);
        }
        if (foodsRes.status === "rejected") {
          console.warn("Admin summary: failed to load foods", foodsRes.reason);
        }
        if (usersRes.status === "rejected") {
          console.warn("Admin summary: failed to load users", usersRes.reason);
        }

        const paidRevenue = orders
          .filter((o) => o.paymentStatus === "paid")
          .reduce((sum, o) => sum + Number(o.subtotal || 0), 0);

        setSummary({
          orders: orders.length,
          bookings: bookings.length,
          foods: foodsCount,
          users: usersCount,
          paidRevenue,
        });
      } catch (error) {
        console.error("Failed to load admin summary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const cards = useMemo(
    () => [
      {
        title: "Revenue",
        value: `Rs. ${summary.paidRevenue.toLocaleString()}`,
        subtitle: "Paid kitchen orders",
        icon: <FiCreditCard />,
      },
      {
        title: "Kitchen Orders",
        value: String(summary.orders),
        subtitle: "All food orders",
        icon: <FiPackage />,
      },
      {
        title: "Dietician Bookings",
        value: String(summary.bookings),
        subtitle: "Consultation bookings",
        icon: <FiUserCheck />,
      },
      {
        title: "Users",
        value: String(summary.users),
        subtitle: `${summary.foods} products active`,
        icon: <FiUsers />,
      },
    ],
    [summary]
  );

  return (
    <section className="adm-section">
      <div className="adm-page-head">
        <h1 className="adm-title">Dashboard Overview</h1>
        <p>Monitor kitchen orders, users, and dietician bookings in one place.</p>
      </div>

      <div className="adm-stats-grid">
        {cards.map((card) => (
          <article key={card.title} className="adm-stat-card">
            <div className="adm-stat-icon">{card.icon}</div>
            <p className="adm-stat-label">{card.title}</p>
            <h3>{loading ? "..." : card.value}</h3>
            <span>{card.subtitle}</span>
          </article>
        ))}
      </div>

      <div className="adm-note-card">
        <FiCoffee className="adm-note-icon" />
        <div>
          <h4>Operations Tip</h4>
          <p>
            Keep order statuses updated from the orders page so users can track
            kitchen progress in their profile.
          </p>
        </div>
      </div>
    </section>
  );
}