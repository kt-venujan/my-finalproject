"use client";

import "./pricing.css";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Basic",
    price: "Rs. 999",
    desc: "Starter Plan",
    features: [
      "AI Diet Plan (Weekly)",
      "Basic Meal Tracking",
      "Limited Features",
    ],
  },
  {
    name: "Standard",
    price: "Rs. 2999",
    desc: "Most Popular",
    features: [
      "AI Diet Plan",
      "Meal Tracking",
      "Dietician Chat",
      "Reminders",
    ],
  },
  {
    name: "Premium",
    price: "Rs. 5999",
    desc: "Full Access",
    features: [
      "Daily AI Diet Plan",
      "Personal Dietician",
      "Kitchen Delivery",
      "Advanced Analytics",
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();

  const handleBuy = (plan: any) => {
    router.push(
      `/payment?plan=${plan.name}&price=${plan.price}`
    );
  };

  return (
    <div className="pricing-section">
      <h1 className="title">Choose Your Plan</h1>

      <div className="pricing-container">
        {plans.map((plan, index) => (
          <div className="flip-card" key={index}>
            <div className="flip-card-inner">

              {/* FRONT */}
              <div className="flip-card-front">
                <h2>{plan.name}</h2>
                <p>{plan.price}</p>
                <span>{plan.desc}</span>
              </div>

              {/* BACK */}
              <div className="flip-card-back">
                <h3>{plan.name} Plan</h3>

                <ul>
                  {plan.features.map((f, i) => (
                    <li key={i}>✔ {f}</li>
                  ))}
                </ul>

                {/* 🔥 BUTTON UPDATED */}
                <button
                  className="buy-btn"
                  onClick={() => handleBuy(plan)}
                >
                  Get Started
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}