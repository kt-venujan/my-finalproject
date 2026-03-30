"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DieticianPage() {
  const router = useRouter();

  const [dieticians, setDieticians] = useState<any[]>([]);

  // 🔥 FETCH DIETICIANS
  const fetchDieticians = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dieticians");
      console.log("DIETICIANS DATA:", res.data);
      setDieticians(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchDieticians();
  }, []);

  // 🔥 BOOK FUNCTION (FINAL)
  const handleBooking = async (dieticianId: string) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first 🔐");
        return router.push("/login");
      }

      console.log("TOKEN:", token);
      console.log("DIETICIAN ID:", dieticianId);

      const res = await axios.post(
        "http://localhost:5000/api/bookings",
        {
          dieticianId,
          date: "2026-04-01",
          time: "10:00 AM",
          mode: "chat",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true, // 🔥 VERY IMPORTANT
        }
      );

      console.log("BOOKING SUCCESS:", res.data);

      // ✅ redirect to chat
      router.push(`/chat/${res.data._id}`);

    } catch (err: any) {
      console.error("BOOKING ERROR:", err.response?.data || err.message);

      alert(
        err.response?.data?.message ||
        "Booking failed ❌"
      );
    }
  };

  return (
    <div className="diet-page">

      {/* 🔥 HERO */}
      <section className="hero-wrap">
        <div className="hero-card">

          <div className="hero-left">
            <h1 className="split-text">
              DIET<span>ICIAN</span>
            </h1>
          </div>

          <div className="hero-center">
            <img src="/diet-face.png" alt="diet" />
          </div>

          <div className="hero-right">
            <h1 className="split-text right-text">
              BOOK<span>ING</span>
            </h1>
          </div>

        </div>
      </section>

      {/* 🔥 SERVICES */}
      <section className="services">
        <div className="service-card">
          <img src="/diet1.jpg" />
          <h3>Cooking Coaching</h3>
        </div>

        <div className="service-card">
          <img src="/diet2.jpg" />
          <h3>Family Nutrition</h3>
        </div>

        <div className="service-card">
          <img src="/diet3.jpg" />
          <h3>Weight Management</h3>
        </div>
      </section>

      {/* 🔥 DIETICIANS */}
      <section className="dieticians">
        <h2>Available Dieticians</h2>

        <div className="diet-grid">
          {dieticians.map((d: any) => {
            const dieticianId = d.user?._id;

            return (
              <div className="diet-card" key={d._id}>
                <img src="/doc.jpg" />

                <h3>{d.user?.username || "No Name"}</h3>
                <p>{d.specialization || "Nutrition Expert"}</p>

                <button
                  onClick={() => {
                    if (!dieticianId) {
                      console.error("❌ INVALID DIETICIAN:", d);
                      alert("Invalid dietician ❌");
                      return;
                    }

                    console.log("CLICKED DIETICIAN:", dieticianId);

                    handleBooking(dieticianId);
                  }}
                >
                  Book Now
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🔥 STEPS */}
      <section className="steps">
        <h2>How It Works</h2>

        <div className="steps-grid">
          <div className="step">1. Book</div>
          <div className="step">2. Chat</div>
          <div className="step">3. Plan</div>
          <div className="step">4. Kitchen</div>
        </div>
      </section>

    </div>
  );
}