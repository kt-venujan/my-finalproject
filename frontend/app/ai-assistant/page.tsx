"use client";

import "./aiAssistant.css";

export default function AIAssistant() {
  return (
    <main className="ai-page">

      <section className="ai-hero">
        <h1>AI Diet Assistant</h1>
        <p>
          Get personalized diet plans using AI based on your lifestyle,
          health goals and preferences.
        </p>
      </section>


      <section className="ai-chat-section">

        <div className="ai-card">

          <h2>Ask Your Diet Question</h2>

          <textarea
            placeholder="Example: I want a weight loss meal plan..."
          />

          <button>Generate Diet Plan</button>

        </div>

      </section>

    </main>
  );
}