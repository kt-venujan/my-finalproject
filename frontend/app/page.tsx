"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ServicesInteractive from "@/components/ServicesInteractive";
import BMICalculator from "@/components/BMICalculator";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);
  const { isLoginOpen, openLogin, closeLogin } = useAuth();


  // 🔥 INSTAGRAM SCRIPT
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://www.instagram.com/embed.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // ================= MAIN PAGE =================
  return (
    <>
      <AuthModal isOpen={isLoginOpen} onClose={closeLogin} />

      <main className="fitness-home">
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-overlay">
            <div className="hero-content">
              <div className="hero-text">
                <h1>Transform Your Diet & Health</h1>

                <p>
                  Achieve your nutrition goals with customized meal plans,
                  expert dietician advice, and a healthier lifestyle tailored
                  for you.
                </p>

                <div className="hero-buttons">
                  <button className="primary-btn" onClick={openLogin}>
                    Get Started
                  </button>
                </div>

                <div className="hero-stats">
                  <div className="stat-box">
                    <h2>500+</h2>
                    <p>Active Members</p>
                  </div>

                  <div className="stat-box">
                    <h2>50+</h2>
                    <p>Expert Dieticians</p>
                  </div>

                  <div className="stat-box">
                    <h2>100+</h2>
                    <p>Healthy Plans</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <ServicesInteractive />

        {/* BMI */}
        <BMICalculator />

        {/* WHY CHOOSE US */}
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

        {/* ALLERGY */}
        <section className="allergy-section">
          <div className="allergy-box">
            <h3>⚠️ Allergy & Health Notice</h3>

            <p>
              If you are aware of any food allergies, please inform us clearly before using our services.
            </p>

            <p>
              If you are unsure, we recommend submitting an allergy report or consulting a medical professional.
            </p>

            <p>
              SmartDiet Hub is not responsible for any allergic reactions caused due to missing or incorrect information.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}