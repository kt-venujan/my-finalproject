"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

/* ---------------- EXISTING DATA ---------------- */
const floatingBadges = [
  { title: "Calories", value: "1,820 kcal", top: "12%", left: "8%" },
  { title: "Protein", value: "92g", top: "28%", right: "3%" },
  { title: "Water", value: "2.5L", bottom: "20%", left: "10%" },
  { title: "BMI", value: "22.4", bottom: "12%", right: "8%" },
];

const particles = Array.from({ length: 18 }, (_, i) => i + 1);

type Question = {
  key: string;
  label: string;
  type: "input" | "options" | "multi-options";
  options?: string[];
};

const baseQuestions: Question[] = [
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
    key: "activityLevel",
    label: "What is your activity level?",
    type: "options",
    options: ["Low", "Moderate", "High"],
  },
  {
    key: "healthConditions",
    label:
      "Do you have any health conditions? Example: diabetes, thyroid, PCOS. If none, type No.",
    type: "input",
  },
  {
    key: "hasAllergies",
    label: "Do you have any allergies?",
    type: "options",
    options: ["Yes", "No"],
  },
  {
    key: "dislikedFoods",
    label:
      "Are there any foods you dislike? Example: bitter gourd, mushroom. If none, type No.",
    type: "input",
  },
  {
    key: "likefoods",
    label: "Are there any foods you like and want to include? Select up to 5.",
    type: "multi-options",
    options: [
      "oats",
      "chicken",
      "fish",
      "egg",
      "vegetables",
      "fruits",
      "nuts",
      "seeds",
      "legumes",
      "sweet potato",
      "quinoa",
      "chia seeds",
      "greek yogurt",
      "avocado",
    ],
  },
  {
    key: "budget",
    label: "What is your food budget level?",
    type: "options",
    options: ["500-1000", "1000-2000", "2000+"],
  },
  {
    key: "cuisinePreference",
    label: "What type of meals do you prefer?",
    type: "options",
    options: ["indian", "Asian", "Mixed Healthy Meals"],
  },
  {
    key: "mealsPerDay",
    label: "How many main meals do you want per day?",
    type: "options",
    options: ["3", "4", "5"],
  },
  {
    key: "wakeUpTime",
    label: "What time do you usually wake up?",
    type: "input",
  },
  {
    key: "sleepTime",
    label: "What time do you usually sleep?",
    type: "input",
  },
  {
    key: "waterIntake",
    label: "How much water do you drink daily? Example: 1L, 2L",
    type: "options",
    options: ["1L-2l", "2L-4l", "4l-5l", "5l+"],
  },
];

type Message = {
  sender: "ai" | "user";
  text: string;
};

export default function AIDietAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<Question[]>(baseQuestions);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [allergyReport, setAllergyReport] = useState<File | null>(null);
  const [selectedLikeFoods, setSelectedLikeFoods] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const current = questions[step];

  useEffect(() => {
    setMessages([
      {
        sender: "ai",
        text: "Hello 👋 I’m your AI diet assistant. I’ll ask a few smart questions and then create a personalized meal suggestion for you.",
      },
      {
        sender: "ai",
        text: baseQuestions[0].label,
      },
    ]);
  }, []);

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (!chatBody) return;

    chatBody.scrollTo({
      top: chatBody.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, completed]);

  const pushAiMessage = (text: string) => {
    setMessages((prev) => [...prev, { sender: "ai", text }]);
  };

  const pushUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { sender: "user", text }]);
  };

  const askNextQuestion = (nextStep: number, updatedQuestions = questions) => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: updatedQuestions[nextStep].label },
      ]);
    }, 350);
  };

  const buildFinalPayload = () => {
    const hasAllergies = form.hasAllergies === "Yes";

    return {
      age: form.age || "",
      gender: form.gender || "",
      height: form.height || "",
      weight: form.weight || "",
      goal: form.goal || "",
      foodPreference: form.foodPreference || "",
      activityLevel: form.activityLevel || "",
      healthConditions: form.healthConditions || "No",
      allergies: hasAllergies ? form.allergyDetails || "Has allergy" : "No",
      hasAllergies: hasAllergies ? "Yes" : "No",
      dislikedFoods: form.dislikedFoods || "No",
      likefoods: form.likefoods || "",
      budget: form.budget || "",
      cuisinePreference: form.cuisinePreference || "",
      mealsPerDay: form.mealsPerDay || "3",
      wakeUpTime: form.wakeUpTime || "",
      sleepTime: form.sleepTime || "",
      waterIntake: form.waterIntake || "",
    };
  };

  const generateDietPlan = async () => {
    try {
      setLoading(true);

      const payload = buildFinalPayload();
      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (allergyReport) {
        formData.append("allergyReport", allergyReport);
      }

      const res = await axios.post(
        "http://localhost:5000/api/ai/generate-diet-plan",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const plan = res.data?.plan;

      const reply = `
Here is your personalized diet suggestion 🍽️

Daily Calories: ${plan?.calories || "N/A"}

Breakfast:
${
  Array.isArray(plan?.breakfast)
    ? plan.breakfast.map((item: string) => `• ${item}`).join("\n")
    : "• Not available"
}

Lunch:
${
  Array.isArray(plan?.lunch)
    ? plan.lunch.map((item: string) => `• ${item}`).join("\n")
    : "• Not available"
}

Dinner:
${
  Array.isArray(plan?.dinner)
    ? plan.dinner.map((item: string) => `• ${item}`).join("\n")
    : "• Not available"
}

Snacks:
${
  Array.isArray(plan?.snacks)
    ? plan.snacks.map((item: string) => `• ${item}`).join("\n")
    : "• Not available"
}

Tips:
${
  Array.isArray(plan?.tips)
    ? plan.tips.map((item: string) => `• ${item}`).join("\n")
    : "• Stay hydrated and eat balanced meals."
}
      `.trim();

      pushAiMessage(reply);
      setCompleted(true);
    } catch (error) {
      console.error(error);
      pushAiMessage(
        "Sorry 😢 I couldn’t generate your diet plan right now. Please check the backend and Gemini API setup."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMultiSelectLikeFoods = (food: string) => {
    if (!current || current.key !== "likefoods" || loading || completed) return;

    let updatedSelections: string[] = [];

    if (selectedLikeFoods.includes(food)) {
      updatedSelections = selectedLikeFoods.filter((item) => item !== food);
    } else {
      if (selectedLikeFoods.length >= 5) return;
      updatedSelections = [...selectedLikeFoods, food];
    }

    setSelectedLikeFoods(updatedSelections);

    if (updatedSelections.length === 5) {
      const joinedValue = updatedSelections.join(", ");

      pushUserMessage(joinedValue);

      const updatedForm = { ...form, likefoods: joinedValue };
      setForm(updatedForm);

      const nextStep = step + 1;
      if (nextStep < questions.length) {
        setStep(nextStep);
        askNextQuestion(nextStep);
      } else {
        generateDietPlan();
      }
    }
  };

  const handleAnswer = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !current || loading || completed) return;

    pushUserMessage(trimmed);

    const updatedForm = { ...form, [current.key]: trimmed };
    setForm(updatedForm);
    setInput("");

    if (current.key === "likefoods") {
      setSelectedLikeFoods([]);
    }

    if (current.key === "hasAllergies") {
      if (trimmed === "Yes") {
        const updatedQuestions = [
          ...questions.slice(0, step + 1),
          {
            key: "allergyDetails",
            label:
              "What allergy do you have? Example: peanuts, milk, egg, seafood.",
            type: "input" as const,
          },
          ...questions.slice(step + 1),
        ];

        setQuestions(updatedQuestions);
        const nextStep = step + 1;
        setStep(nextStep);
        askNextQuestion(nextStep, updatedQuestions);
        return;
      }
    }

    if (current.key === "allergyDetails") {
      pushAiMessage(
        "If you have an allergy report, you can upload it now. Otherwise press Skip Report."
      );
      return;
    }

    const nextStep = step + 1;

    if (nextStep < questions.length) {
      setStep(nextStep);
      askNextQuestion(nextStep);
      return;
    }

    await generateDietPlan();
  };

  const handleUploadReport = async (file: File | null) => {
    if (!file) return;
    setAllergyReport(file);
    pushUserMessage(`Uploaded report: ${file.name}`);
    await generateDietPlan();
  };

  const handleSkipReport = async () => {
    pushUserMessage("Skip Report");
    await generateDietPlan();
  };

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

      <section id="chatbot" className="chat-section">
        <div className="study-chat-shell">
          <div className="study-chat-header">
            <h2>AI Diet Assistant</h2>
            <p>
              Chat with AI to get a personalized meal suggestion for breakfast,
              lunch, dinner, and snacks.
            </p>
          </div>

          <div ref={chatBodyRef} className="study-chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`study-chat-bubble ${msg.sender}`}>
                <pre>{msg.text}</pre>
              </div>
            ))}

            {loading && (
              <div className="study-chat-bubble ai">
                <pre>Generating your personalized diet plan...</pre>
              </div>
            )}

            {completed && !loading && (
              <div className="after-plan-flow" data-scroll-reveal>
                <p className="after-plan-title">Your plan is ready. Choose the next step.</p>
                <p className="after-plan-text">
                  Continue with expert guidance or compare memberships before you proceed.
                </p>

                <div className="after-plan-actions">
                  <Link href="/dietician" className="after-plan-btn primary">
                    Book Dietician Now
                  </Link>

                  <Link href="/pricing" className="after-plan-btn secondary">
                    See Pricing Plans
                  </Link>
                </div>

                <Link href="/kitchen" className="after-plan-link">
                  Need prepared healthy meals too? Explore Kitchen options.
                </Link>
              </div>
            )}
          </div>

          {!completed && !loading && current?.key !== "allergyDetails" && (
            <div className="study-chat-footer">
              {current?.type === "multi-options" && current.options ? (
                <div className="study-multi-select-wrap">
                  <div className="study-multi-select-info">
                    Selected: {selectedLikeFoods.length}/5
                  </div>

                  <div className="study-option-grid">
                    {current.options.map((opt) => {
                      const active = selectedLikeFoods.includes(opt);

                      return (
                        <button
                          key={opt}
                          type="button"
                          className={`study-option-btn ${active ? "active" : ""}`}
                          onClick={() => handleMultiSelectLikeFoods(opt)}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : current?.type === "options" && current.options ? (
                <div className="study-option-grid">
                  {current.options.map((opt) => (
                    <button
                      key={opt}
                      className="study-option-btn"
                      onClick={() => handleAnswer(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="study-input-row">
                  <input
                    type="text"
                    value={input}
                    placeholder="Type your answer..."
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAnswer(input);
                    }}
                  />
                  <button onClick={() => handleAnswer(input)}>Send</button>
                </div>
              )}
            </div>
          )}

          {!completed && !loading && current?.key === "allergyDetails" && (
            <div className="study-chat-footer">
              <div className="study-input-row">
                <input
                  type="text"
                  value={input}
                  placeholder="Type allergy details..."
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAnswer(input);
                  }}
                />
                <button onClick={() => handleAnswer(input)}>Send</button>
              </div>

              <div className="report-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden-file-input"
                  onChange={(e) =>
                    handleUploadReport(e.target.files?.[0] || null)
                  }
                />

                <button
                  className="study-option-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Allergy Report
                </button>

                <button
                  className="study-option-btn"
                  onClick={handleSkipReport}
                >
                  Skip Report
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}