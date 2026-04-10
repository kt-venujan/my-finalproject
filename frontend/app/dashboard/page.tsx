"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import "./dashboard.css";
import {
  FiCoffee,
  FiDroplet,
  FiActivity,
  FiPackage,
  FiMoon,
} from "react-icons/fi";

type Appointment = {
  _id: string;
  date: string;
  time: string;
  dietician: {
    username: string;
    email: string;
  };
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Fetch user bookings
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get(
          "/appointments/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAppointments(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="dashboard-wrapper">
      {/* ===== HEADER ===== */}
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}</h1>
        <p>Track your health, meals, and appointments</p>
      </div>

      {/* ===== STATS ===== */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Calories</h3>
          <p>1,850 kcal</p>
        </div>

        <div className="stat-card">
          <h3>Meals Today</h3>
          <p>3 / 5</p>
        </div>

        <div className="stat-card">
          <h3>Water Intake</h3>
          <p>1.5 L</p>
        </div>

        <div className="stat-card">
          <h3>Goal Progress</h3>
          <p>70%</p>
        </div>
      </div>

      {/* ===== GRID ===== */}
      <div className="dashboard-grid">
        {/* LEFT */}
        <div className="dashboard-left">
          <div className="dash-card">
            <h2>Subscriptions</h2>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </div>

          <div className="card">
            <h2>Today's Meal Plan</h2>
            <ul>
              <li>
                <span className="dash-icon"><FiCoffee /></span>
                Breakfast: Oats + Fruits
              </li>
              <li>
                <span className="dash-icon"><FiPackage /></span>
                Lunch: Rice + Chicken + Veg
              </li>
              <li>
                <span className="dash-icon"><FiActivity /></span>
                Snack: Sandwich
              </li>
              <li>
                <span className="dash-icon"><FiMoon /></span>
                Dinner: Soup + Salad
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT */}
        <div className="dashboard-right">
          <div className="dash-card">
            <h2>Quick Actions</h2>
            <div className="actions">
              <button onClick={() => router.push("/dietician")}>
                Book Dietician
              </button>

              <button>Add Meal</button>
              <button>Track Weight</button>
            </div>
          </div>

          {/* Appointment card */}
          <div className="dash-card">
            <h2>Appointments</h2>

            {appointments.length === 0 ? (
              <p>No bookings yet</p>
            ) : (
              appointments.map((a) => (
                <div key={a._id} className="appointment">
                  <p><strong>Doctor:</strong> {a.dietician?.username}</p>
                  <p><strong>Date:</strong> {a.date}</p>
                  <p><strong>Time:</strong> {a.time}</p>
                </div>
              ))
            )}
          </div>

          <div className="dash-card">
            <h2>Meal Plans</h2>
            <p className="dash-tip">
              <span className="dash-icon"><FiDroplet /></span>
              Drink at least 2L water daily
            </p>
            <p className="dash-tip">
              <span className="dash-icon"><FiActivity /></span>
              Avoid processed sugar
            </p>
            <p className="dash-tip">
              <span className="dash-icon"><FiPackage /></span>
              Maintain balanced meals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}