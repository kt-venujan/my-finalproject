"use client";

import "./ai-assistant.css";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";

/* ---------------- EXISTING DATA ---------------- */
const floatingBadges = [
  { title: "Calories", value: "1,820 kcal", top: "12%", left: "8%" },
  { title: "Protein", value: "92g", top: "28%", right: "3%" },
  { title: "Water", value: "2.5L", bottom: "20%", left: "10%" },
  { title: "BMI", value: "22.4", bottom: "12%", right: "8%" },
];

const particles = Array.from({ length: 18 }, (_, i) => i + 1);

/* ---------------- QUESTIONS ---------------- */
const questions = [
  { key: "age", label: "What is your age?", type: "input" },

  {
    key: "gender",
    label: "Select your gender",
    type: "options",
    options: ["Male", "Female"],
  },

  { key: "height", label: "What is your height (cm)?", type: "input" },

  { key: "weight", label: "What is your weight (kg)?", type: "input" },

  {
    key: "goal",
    label: "What is your goal?",
    type: "options",
    options: ["Weight Loss", "Weight Gain", "Maintain"],
  },

  {
    key: "foodPreference",
    label: "Veg or Non-Veg?",
    type: "options",
    options: ["Veg", "Non-Veg"],
  },

  {
    key: "allergies",
    label: "Any allergies?",
    type: "options",
    options: ["Yes", "No"],
  },
];

export default function AIDietAssistantPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>({});
  const [plan, setPlan] = useState<any>(null);
  const [input, setInput] = useState("");

  const current = questions[step];
  const [chatMode, setChatMode] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  /* ---------------- BACK FUNCTION ---------------- */
  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

/* ---------------- HANDLE ANSWER ---------------- */
const handleAnswer = async (value: string) => {
  if (!value) return;

  const updated = { ...form, [current.key]: value };
  setForm(updated);
  setInput("");

  if (step < questions.length - 1) {
    setStep(step + 1);
  }
};

/* ---------------- SEND MESSAGE FUNCTION ---------------- */
const sendMessage = async () => {
  if (!input) return;

  const userMsg = { sender: "user", text: input };

  setMessages((prev) => [...prev, userMsg]);

  const res = await axios.post(
   "http://localhost:5000/api/ai/generate",
    {
      sessionId,
      message: input,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  setMessages((prev) => [
    ...prev,
    { sender: "ai", text: res.data.reply },
  ]);

  setInput("");
};

  return (
    <main className="ai-page">
      <div className="ai-bg-grid" />
      <div className="ai-bg-glow ai-glow-1" />
      <div className="ai-bg-glow ai-glow-2" />

      {/* ================= HERO ================= */}
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
            <a href="#chatbot" className="ai-btn primary">
              Start Now
            </a>

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
              <img src="/ai-robot.png" alt="AI Robot" />
            </div>

            {particles.map((item) => (
              <span key={item} className={`particle particle-${item}`} />
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

      {/* ================= CHATBOT ================= */}
      <section id="chatbot" className="chat-section">
        <div className="chat-box">
          {!chatMode ? (
            <>
              <h2>{current.label}</h2>

              {/* INPUT */}
              {current.type === "input" && (
                <>
                  <div className="chat-input-row">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAnswer(input);
                      }}
                    />

                    <button
                      className="chat-next-btn"
                      onClick={() => handleAnswer(input)}
                    >
                      Next →
                    </button>
                  </div>

                  {step > 0 && (
                    <button className="chat-back-btn" onClick={goBack}>
                      ← Back
                    </button>
                  )}
                </>
              )}

              {chatMode && (
               <div className="chat-container">
               {messages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.sender}`}>
                 {msg.text}
               </div>
             ))}

              <div className="chat-input-box">
            <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask anything..."
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />

      <button onClick={sendMessage}>Send</button>
          </div>
             </div>
        )}

              {/* OPTIONS */}
              {current.type === "options" && current.options && (
                <>
                  <div className="option-grid">
                    {current.options.map((opt: string) => (
                      <button
                        key={opt}
                        className="option-btn"
                        onClick={() => handleAnswer(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {step > 0 && (
                    <button className="chat-back-btn" onClick={goBack}>
                      ← Back
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <h2>Your Diet Plan</h2>
              <p>Daily Calories: {plan.calories}</p>

              <h3>Breakfast</h3>
              {plan.breakfast.map((i: string, idx: number) => (
                <p key={idx}>{i}</p>
              ))}

              <h3>Lunch</h3>
              {plan.lunch.map((i: string, idx: number) => (
                <p key={idx}>{i}</p>
              ))}

              <h3>Dinner</h3>
              {plan.dinner.map((i: string, idx: number) => (
                <p key={idx}>{i}</p>
              ))}

              <div style={{ marginTop: 20 }}>
                <button className="ai-btn primary">Save Plan</button>
                <button className="ai-btn secondary">Order Meals</button>
                <button className="ai-btn secondary">Book Dietician</button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}