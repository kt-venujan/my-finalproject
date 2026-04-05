"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BookingModal from "@/components/BookingModal";
import ServicesInteractive from "@/components/ServicesInteractive";
import BMICalculator from "@/components/BMICalculator";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { motion } from "framer-motion";
import { FiActivity, FiShield, FiTrendingUp, FiUserCheck } from "react-icons/fi";

const HERO_SLIDES = [
  {
    image: "/diet-hero.jpg",
    title: "Transform Your Diet & Health",
    description:
      "Achieve your nutrition goals with customized meal plans, expert dietician advice, and a healthier lifestyle tailored for you.",
  },
];

const HERO_ORBIT_ITEMS = [
  { src: "/ingredients/tomato-slice.png", alt: "Tomato slice" },
  { src: "/ingredients/red-onion.png", alt: "Red onion" },
  { src: "/hero-food-2.png", alt: "Healthy dish" },
  { src: "/ingredients/tomato-half.png", alt: "Tomato half" },
  { src: "/hero-food-3.png", alt: "Meal garnish" },
  { src: "/hero-food.png", alt: "Fresh ingredients" },
];

const HERO_ORBIT_RADIUS = 168;

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
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handleBook = (d: Dietician) => {
    if (!user) { openLogin(); return; }
    if (user.role !== "user") return;
    setSelected(d);
  };

  return (
    <>
      {selected && (
        <BookingModal dietician={selected} onClose={() => setSelected(null)} />
      )}

      <main className="fitness-home">

        {/* ===== HERO ===== */}
        <section className="hero-section">
          <div className="hero-bg-slider" aria-hidden="true">
            {HERO_SLIDES.map((slide, index) => (
              <div
                key={slide.image}
                className={`hero-bg-slide ${index === currentHeroSlide ? "active" : ""}`}
                style={{ backgroundImage: `url("${slide.image}")` }}
              />
            ))}
          </div>

          <div className="hero-overlay">
            <div className="hero-content">
              <div className="hero-text hero-copy-anim" key={currentHeroSlide}>
                <h1>{HERO_SLIDES[currentHeroSlide].title}</h1>
                <p>{HERO_SLIDES[currentHeroSlide].description}</p>
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

              <div className="hero-orbit-shell" aria-hidden="true">
                <motion.div
                  className="hero-orbit-ring hero-orbit-ring-main"
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                  className="hero-orbit-ring hero-orbit-ring-alt"
                  initial={{ opacity: 0, scale: 0.76 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                />

                <motion.div
                  className="hero-orbit-rotor"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                  {HERO_ORBIT_ITEMS.map((item, index) => {
                    const angle = (index / HERO_ORBIT_ITEMS.length) * Math.PI * 2 - Math.PI / 2;
                    const x = Math.cos(angle) * HERO_ORBIT_RADIUS;
                    const y = Math.sin(angle) * HERO_ORBIT_RADIUS;

                    return (
                      <motion.div
                        key={item.src}
                        className="hero-orbit-node"
                        initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
                        animate={{ opacity: 1, scale: 1, x, y }}
                        transition={{
                          delay: 0.35 + index * 0.16,
                          type: "spring",
                          stiffness: 120,
                          damping: 12,
                        }}
                      >
                        <div className="hero-orbit-node-inner">
                          <Image
                            src={item.src}
                            alt={item.alt}
                            width={36}
                            height={36}
                            className="hero-orbit-node-img"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                <motion.div
                  className="hero-orbit-center"
                  initial={{ opacity: 0, scale: 0.72 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, type: "spring", stiffness: 115, damping: 14 }}
                >
                  <div className="hero-orbit-center-media">
                    <Image
                      src="/food2.jpg"
                      alt="Healthy signature meal"
                      fill
                      className="hero-orbit-center-img"
                      priority
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>



        {/* ===== SERVICES ===== */}
        <ServicesInteractive />

        {/* ===== BMI ===== */}
        <BMICalculator />

        {/* ===== WHY CHOOSE US ===== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#12020a] via-[#1a040f] to-[#100208] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ff9eb5]">
                Why Choose Us
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Built For Better Nutrition Outcomes
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#ffdce5]/80 sm:text-lg">
                Dietara combines expert guidance, practical meal planning, and
                smart progress tracking so your healthy routine becomes easier
                to maintain every day.
              </p>
            </div>

            <div className="mt-12 grid items-center gap-6 lg:grid-cols-3">
              <div className="space-y-6">
                <div className="group rounded-2xl border border-[#ff7894]/25 bg-[rgba(52,7,24,0.7)] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff9eb5]/60 hover:shadow-[0_0_35px_rgba(255,94,140,0.35)]">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff9eb5]/15 text-[#ffdce5] transition-all duration-300 group-hover:bg-[#ff9eb5]/30 group-hover:text-white group-hover:shadow-[0_0_18px_rgba(255,130,170,0.45)]">
                    <FiShield className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold text-white">Customized Plans</h3>
                  <p className="mt-2 text-[#ffdce5]/80">
                    Personalized meal plans designed around your goals,
                    preferences, and health conditions.
                  </p>
                </div>

                <div className="group rounded-2xl border border-[#ff7894]/25 bg-[rgba(52,7,24,0.7)] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff9eb5]/60 hover:shadow-[0_0_35px_rgba(255,94,140,0.35)]">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff9eb5]/15 text-[#ffdce5] transition-all duration-300 group-hover:bg-[#ff9eb5]/30 group-hover:text-white group-hover:shadow-[0_0_18px_rgba(255,130,170,0.45)]">
                    <FiUserCheck className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold text-white">Expert Dieticians</h3>
                  <p className="mt-2 text-[#ffdce5]/80">
                    Work with certified nutrition professionals for safe,
                    sustainable, and evidence-based guidance.
                  </p>
                </div>
              </div>

              <div className="mx-auto flex h-80 w-80 items-center justify-center rounded-full border border-[#ff7894]/30 bg-[radial-gradient(circle_at_center,#390715_0%,#17040c_65%,#0f0208_100%)] shadow-[0_0_48px_rgba(255,84,126,0.3)] sm:h-96 sm:w-96">
                <div className="relative h-44 w-44 sm:h-52 sm:w-52">
                  <Image
                    src="/logo.png"
                    alt="Dietara Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_18px_rgba(255,100,145,0.45)]"
                    priority
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="group rounded-2xl border border-[#ff7894]/25 bg-[rgba(52,7,24,0.7)] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff9eb5]/60 hover:shadow-[0_0_35px_rgba(255,94,140,0.35)]">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff9eb5]/15 text-[#ffdce5] transition-all duration-300 group-hover:bg-[#ff9eb5]/30 group-hover:text-white group-hover:shadow-[0_0_18px_rgba(255,130,170,0.45)]">
                    <FiTrendingUp className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold text-white">Smart Tracking</h3>
                  <p className="mt-2 text-[#ffdce5]/80">
                    Monitor meals, habits, and progress with actionable insights
                    that keep you accountable.
                  </p>
                </div>

                <div className="group rounded-2xl border border-[#ff7894]/25 bg-[rgba(52,7,24,0.7)] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff9eb5]/60 hover:shadow-[0_0_35px_rgba(255,94,140,0.35)]">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff9eb5]/15 text-[#ffdce5] transition-all duration-300 group-hover:bg-[#ff9eb5]/30 group-hover:text-white group-hover:shadow-[0_0_18px_rgba(255,130,170,0.45)]">
                    <FiActivity className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold text-white">Healthy Kitchen</h3>
                  <p className="mt-2 text-[#ffdce5]/80">
                    Access balanced meals prepared with nutrition-first standards
                    for consistent daily support.
                  </p>
                </div>
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