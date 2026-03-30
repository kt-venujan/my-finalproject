"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
type ServiceItem = {
  title: string;
  desc: string;
  image: string;
  link: string;
};

export default function ServicesInteractive() {
  const router = useRouter();
  const [active, setActive] = useState(0);

  const services: ServiceItem[] = [
    {
      title: "AI Diet Assistant",
      desc: "Generate personalized diet plans using AI.",
      image: "/ai.jpg",
      link: "/ai-assistant",
    },
    {
      title: "Dietician Consultation",
      desc: "Connect with certified nutrition experts.",
      image: "/dietician.jpg",
      link: "/dietician",
    },
    {
      title: "Dietary Kitchen",
      desc: "Order healthy meals.",
      image: "/kitchen.jpg",
      link: "/kitchen",
    },
  
    {
      title: "Smart Reminders",
      desc: "Get reminders.",
      image: "/reminder.jpg",
      link: "/reminder",
    },
  ];

  const handleProtectedOpen = (path: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      // alert REMOVE
      // alert("⚠ Please login first!");

      //  TOAST ADD
      toast.error("Please login first!");

      return; // IMPORTANT (navigation stop)
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
              key={service.title}
              className={`service-item ${active === index ? "active" : ""}`}
              onMouseEnter={() => setActive(index)}
            >
              <div className="service-row">
                <div className="service-text">
                  <h3>{service.title}</h3>
                  <p>{service.desc}</p>
                </div>

                <button
                  type="button"
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
          <img
            src={services[active].image}
            alt={services[active].title}
            className="services-preview-image"
          />
        </div>
      </div>
    </section>
  );
}