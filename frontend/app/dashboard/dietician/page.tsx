"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/axios";
import { toast } from "react-toastify";

type Booking = {
  _id: string;
  date: string;
  time: string;
  status: string;
  paymentStatus: string;
  dieticianAlertSeen: boolean;
  user: {
    username: string;
    email: string;
  };
};

export default function DieticianDashboard() {
  const [active, setActive] = useState("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const prevCount = useRef(0);

  // 🔥 FETCH BOOKINGS FROM BACKEND
  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/dietician/my");
      const data = res.data || [];

      setBookings(data);

      // 🔔 NEW PAYMENT ALERT
      const newAlerts = data.filter((b: Booking) => !b.dieticianAlertSeen);

      if (newAlerts.length > prevCount.current) {
        toast.success("💰 New Payment Received!");
      }

      prevCount.current = newAlerts.length;

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchBookings();

    const interval = setInterval(fetchBookings, 5000); // 🔥 every 5 sec

    return () => clearInterval(interval);
  }, []);

  // 🔥 STATS
  const total = bookings.length;
  const paid = bookings.filter(b => b.paymentStatus === "paid").length;
  const pending = bookings.filter(b => b.status === "pending").length;
  const unpaid = bookings.filter(b => b.paymentStatus !== "paid").length;

  return (
    <div className="page-wrapper">
      <div className="layout">

        {/* SIDEBAR */}
        <div className="sidebar">
          <h2>Dietara</h2>

          <ul>
            <li className={active === "dashboard" ? "active" : ""} onClick={() => setActive("dashboard")}>
              Dashboard
            </li>

            <li className={active === "bookings" ? "active" : ""} onClick={() => setActive("bookings")}>
              My Bookings
            </li>

            <li className={active === "consult" ? "active" : ""} onClick={() => setActive("consult")}>
              Consultations
            </li>

            <li className={active === "notify" ? "active" : ""} onClick={() => setActive("notify")}>
              Notifications
            </li>

            <li className={active === "settings" ? "active" : ""} onClick={() => setActive("settings")}>
              Settings
            </li>
          </ul>
        </div>

        {/* MAIN */}
        <div className="main">

          {/* DASHBOARD */}
          {active === "dashboard" && (
            <>
              <h1>Dietician Dashboard</h1>
              <p>Welcome to your dashboard</p>

              {/* STATS */}
              <div className="stats">
                <div className="card">
                  <h3>{total}</h3>
                  <p>Total Bookings</p>
                </div>

                <div className="card green">
                  <h3>{paid}</h3>
                  <p>Paid</p>
                </div>

                <div className="card orange">
                  <h3>{pending}</h3>
                  <p>Pending</p>
                </div>

                <div className="card red">
                  <h3>{unpaid}</h3>
                  <p>Unpaid</p>
                </div>
              </div>
            </>
          )}

          {/* BOOKINGS */}
          {active === "bookings" && (
            <>
              <h2>📅 My Bookings</h2>

              {bookings.length === 0 ? (
                <p>No bookings yet</p>
              ) : (
                bookings.map((b) => (
                  <div key={b._id} className="booking-card">
                    <div>
                      <h4>{b.user?.username}</h4>
                      <p>{b.user?.email}</p>
                      <p>{b.date} - {b.time}</p>
                      <p>Status: {b.status}</p>
                      <p>Payment: {b.paymentStatus}</p>
                    </div>

                    <button className="start-btn">
                      Start Consultation
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {/* CONSULT */}
          {active === "consult" && (
            <>
              <h2>💬 Consultations</h2>
              <p>Start your consultations here</p>
            </>
          )}

          {/* NOTIFICATIONS */}
          {active === "notify" && (
            <>
              <h2>🔔 Notifications</h2>
              <p>You have {pending} pending bookings</p>
            </>
          )}

          {/* SETTINGS */}
          {active === "settings" && (
            <>
              <h2>⚙️ Settings</h2>
              <p>Manage your profile</p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}