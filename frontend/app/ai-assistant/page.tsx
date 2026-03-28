"use client";

import "./ai-assistant.css";
import Link from "next/link";

const floatingBadges = [
  { title: "Calories", value: "1,820 kcal", top: "12%", left: "8%" },
  { title: "Protein", value: "92g", top: "28%", right: "3%" },
  { title: "Water", value: "2.5L", bottom: "20%", left: "10%" },
  { title: "BMI", value: "22.4", bottom: "12%", right: "8%" },
];

const particles = Array.from({ length: 18 }, (_, i) => i + 1);

export default function AIDietAssistantPage() {
  return (
    <main className="ai-page">
      <div className="ai-bg-grid" />
      <div className="ai-bg-glow ai-glow-1" />
      <div className="ai-bg-glow ai-glow-2" />

      <section className="ai-hero">
        <div className="ai-left">
          <span className="ai-tag">Dietara AI NUTRITION</span>

          <h1>
            Your <span>AI Diet Assistant</span> for a Smarter,
            Healthier Lifestyle
          </h1>

          <p>
            Get personalized meal suggestions, calorie guidance, water tracking,
            and nutrition insights with an intelligent AI assistant designed to
            support your daily health journey.
          </p>

          <div className="ai-actions">
            <Link href="/login" className="ai-btn primary">
              Start Now
            </Link>

            <a href="#ai-features" className="ai-btn secondary">
              Explore Features
            </a>
          </div>

          <div className="ai-stats">
            <div className="ai-stat-card">
              <h3>10K+</h3>
              <p>Diet plans generated</p>
            </div>

            <div className="ai-stat-card">
              <h3>95%</h3>
              <p>User satisfaction</p>
            </div>

            <div className="ai-stat-card">
              <h3>24/7</h3>
              <p>AI assistance</p>
            </div>
          </div>
        </div>

        <div className="ai-right">
          <div className="robot-scene">
            <div className="robot-glow" />
            <div className="orbit orbit-1" />
            <div className="orbit orbit-2" />
            <div className="orbit orbit-3" />

            <div className="robot-core">
              <img src="/ai-robot.png" alt="AI Diet Assistant Robot" />
            </div>

            <div className="pulse pulse-1" />
            <div className="pulse pulse-2" />
            <div className="pulse pulse-3" />

            {particles.map((item) => (
              <span
                key={item}
                className={`particle particle-${item}`}
              />
            ))}

            {floatingBadges.map((badge, index) => (
              <div
                key={index}
                className={`floating-badge badge-${index + 1}`}
                style={badge as React.CSSProperties}
              >
                <small>{badge.title}</small>
                <strong>{badge.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}