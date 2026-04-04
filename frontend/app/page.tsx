"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookingModal from "@/components/BookingModal";
import ServicesInteractive from "@/components/ServicesInteractive";
import BMICalculator from "@/components/BMICalculator";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

type Dietician = {
  _id: string;
  user: { _id: string; username: string; email: string };
  specialization: string;
  bio: string;
  experience: number;
  price: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  availableSlots: string[];
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="hp-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
      <span className="hp-rating-val">{rating > 0 ? rating.toFixed(1) : "New"}</span>
    </span>
  );
}

export default function HomePage() {
  const { isLoginOpen, openLogin, closeLogin, user } = useAuth();
  const [dieticians, setDieticians] = useState<Dietician[]>([]);
  const [selected, setSelected] = useState<Dietician | null>(null);

  // Load top dieticians
  useEffect(() => {
    api.get("/dieticians").then((r) => setDieticians(r.data.slice(0, 6))).catch(() => {});
  }, []);

  // Instagram embed
  useEffect(() => {
    const existing = document.querySelector('script[src="https://www.instagram.com/embed.js"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleBook = (d: Dietician) => {
    if (!user) { openLogin(); return; }
    if (user.role !== "user") return;
    setSelected(d);
  };

  return (
    <>
      <AuthModal isOpen={isLoginOpen} onClose={closeLogin} />

      {selected && (
        <BookingModal dietician={selected} onClose={() => setSelected(null)} />
      )}

      <main className="fitness-home">

        {/* ===== HERO ===== */}
        <section className="hero-section">
          <div className="hero-overlay">
            <div className="hero-content">
              <div className="hero-text">
                <h1>Transform Your Diet &amp; Health</h1>
                <p>
                  Achieve your nutrition goals with customized meal plans,
                  expert dietician advice, and a healthier lifestyle tailored for you.
                </p>
                <div className="hero-buttons">
                  <button className="primary-btn" onClick={openLogin}>
                    Get Started
                  </button>
                  <Link href="/dietician" className="secondary-btn" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                    Meet Dieticians
                  </Link>
                </div>
                <div className="hero-stats">
                  <div className="stat-box"><h2>500+</h2><p>Active Members</p></div>
                  <div className="stat-box"><h2>50+</h2><p>Expert Dieticians</p></div>
                  <div className="stat-box"><h2>100+</h2><p>Healthy Plans</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== DIETICIAN DIRECTORY ===== */}
        {dieticians.length > 0 && (
          <section className="hp-diet-section">
            <div className="hp-diet-header">
              <div>
                <h2>Our Expert Dieticians</h2>
                <p>Book a personalized consultation with a certified nutrition professional</p>
              </div>
              <Link href="/dietician" className="hp-view-all">
                View All →
              </Link>
            </div>

            <div className="hp-diet-grid">
              {dieticians.map((d) => (
                <div key={d._id} className="hp-diet-card">
                  <div className="hp-diet-avatar">
                    {d.avatar ? (
                      <img src={(d as any).avatar} alt={d.user?.username} />
                    ) : (
                      <span>{d.user?.username?.[0]?.toUpperCase() || "D"}</span>
                    )}
                  </div>
                  <div className="hp-diet-info">
                    <div className="hp-diet-name-row">
                      <h3>{d.user?.username}</h3>
                      {d.isVerified && <span className="hp-verified">✅</span>}
                    </div>
                    <p className="hp-diet-spec">{d.specialization}</p>
                    <StarRating rating={d.rating || 0} />
                    <div className="hp-diet-meta">
                      {d.experience > 0 && <span>🎓 {d.experience} yrs</span>}
                      <span>💰 Rs. {(d.price || 1500).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    className="hp-book-btn"
                    disabled={!d.isAvailable}
                    onClick={() => handleBook(d)}
                  >
                    {d.isAvailable ? "Book Now" : "Busy"}
                  </button>
                </div>
              ))}
            </div>

            <div className="hp-diet-footer">
              <Link href="/dietician" className="hp-explore-btn">
                Explore All Dieticians
              </Link>
            </div>
          </section>
        )}

        {/* ===== SERVICES ===== */}
        <ServicesInteractive />

        {/* ===== BMI ===== */}
        <BMICalculator />

        {/* ===== WHY CHOOSE US ===== */}
        <section className="why-section-premium">
          <div className="why-title">
            <h2>Why Choose Us</h2>
            <p>
              Dietara helps you build healthier eating habits with expert guidance,
              smart tracking, and quality meal support.
            </p>
          </div>
          <div className="why-container">
            <div className="why-left">
              <div className="why-card-premium">
                <div className="why-icon">🥗</div>
                <h3>Customized Plans</h3>
                <p>Customized meal plans based on your health goals.</p>
              </div>
              <div className="why-card-premium">
                <div className="why-icon">👩‍⚕️</div>
                <h3>Expert Dieticians</h3>
                <p>Get trusted advice from certified nutrition professionals.</p>
              </div>
            </div>
            <div className="why-center">
              <div className="why-logo-premium">
                <img src="/logo.png" alt="Dietara Logo" />
              </div>
            </div>
            <div className="why-right">
              <div className="why-card-premium">
                <div className="why-icon">📊</div>
                <h3>Smart Tracking</h3>
                <p>Track your meals and progress easily.</p>
              </div>
              <div className="why-card-premium">
                <div className="why-icon">🍲</div>
                <h3>Healthy Kitchen</h3>
                <p>Enjoy balanced meals prepared with care.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ALLERGY ===== */}
        <section className="allergy-section">
          <div className="allergy-box">
            <h3>⚠️ Allergy &amp; Health Notice</h3>
            <p>If you are aware of any food allergies, please inform us clearly before using our services.</p>
            <p>If you are unsure, we recommend submitting an allergy report or consulting a medical professional.</p>
            <p>SmartDiet Hub is not responsible for any allergic reactions caused due to missing or incorrect information.</p>
          </div>
        </section>

      </main>
    </>
  );
}