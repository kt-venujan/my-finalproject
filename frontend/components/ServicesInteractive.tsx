"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ServicesInteractive() {
  const router = useRouter();
  const [active, setActive] = useState(1);

  const services = [
    { title: "AI Diet Assistant", desc: "Generate personalized diet plans using AI.", image: "/ai.jpg", link: "/ai-assistant" },
    { title: "Dietician Consultation", desc: "Connect with certified nutrition experts.", image: "/dietician.jpg", link: "/dietician" },
    { title: "Dietary Kitchen", desc: "Order healthy meals.", image: "/kitchen.jpg", link: "/kitchen" },
    { title: "Meal Tracking & Analytics", desc: "Track nutrition progress.", image: "/track.jpg", link: "/tracking" },
    { title: "Smart Reminders", desc: "Get reminders.", image: "/reminder.jpg", link: "/reminders" },
  ];

  const handleProtectedOpen = (path: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("⚠ Please login first!");
      router.push(`/login?next=${encodeURIComponent(path)}`);
      return;
    }

    router.push(path);
  };

  return (
    <section className="services-section">
      <h2 className="services-title">How SmartDiet Hub Helps You</h2>

      <div className="services-container">
        <div className="services-list">
          {services.map((service, index) => (
            <div
              key={index}
              className={`service-item ${active === index ? "active" : ""}`}
              onMouseEnter={() => setActive(index)}
            >
              <div className="service-row">
                <div className="service-text">
                  <h3>{service.title}</h3>
                  <p>{service.desc}</p>
                </div>

                <button
                  className="service-open-btn"
                  onClick={() => handleProtectedOpen(service.link)}
                >
                  Click Here
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="services-image">
          <img src={services[active].image} />
        </div>
      </div>
    </section>
  );
}