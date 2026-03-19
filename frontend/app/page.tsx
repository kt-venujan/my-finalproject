"use client";

import Link from "next/link";
import { useEffect } from "react";
import ServicesInteractive from "@/components/ServicesInteractive";
import BMICalculator from "@/components/BMICalculator";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { isLoginOpen, openLogin, closeLogin } = useAuth();
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
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={openLogin} // ✅ FIX
                  >
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
      </main>
    </>
  );
}