import OpenAI from "openai";
import AiChatSession from "../models/AiChatSession.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const buildInitialPlan = ({
  age,
  gender,
  weight,
  height,
  goal,
  foodPreference,
  allergies,
}) => {
  const weightNum = Number(weight);
  const heightNum = Number(height);

  const heightInMeters = heightNum / 100;
  const bmi = Number(
    (weightNum / (heightInMeters * heightInMeters || 1)).toFixed(1)
  );

  let calories = 1800;

  if (goal === "Weight Loss") calories = 1500;
  else if (goal === "Weight Gain") calories = 2500;
  else if (goal === "Maintain") calories = 2000;

  let breakfast = [];
  let lunch = [];
  let dinner = [];

  if (foodPreference === "Veg") {
    breakfast = ["Oats", "Banana", "Almonds", "Green Tea"];
    lunch = ["Brown Rice", "Vegetables", "Dal"];
    dinner = ["Salad", "Vegetable Soup"];
  } else {
    breakfast = ["Boiled Eggs", "Oats", "Black Coffee"];
    lunch = ["Chicken", "Rice", "Vegetables"];
    dinner = ["Fish", "Salad"];
  }

  if (goal === "Weight Loss") {
    breakfast.push("Low Sugar Foods");
    lunch.push("Less Oil");
    dinner.push("Light Dinner");
  }

  if (goal === "Weight Gain") {
    breakfast.push("Peanut Butter");
    lunch.push("Extra Rice");
    dinner.push("Milk / Protein Shake");
  }

  if (bmi < 18.5) {
    breakfast.push("High Calorie Smoothie");
    lunch.push("Healthy Fats");
    dinner.push("Extra Protein");
  }

  if (bmi > 25) {
    breakfast.push("Low Carb Foods");
    lunch.push("More Vegetables");
    dinner.push("No Sugary Drinks");
  }

  if (allergies === "Yes") {
    breakfast = breakfast.filter(
      (item) => !item.toLowerCase().includes("egg")
    );
    lunch = lunch.filter(
      (item) => !item.toLowerCase().includes("chicken")
    );
    dinner = dinner.filter(
      (item) => !item.toLowerCase().includes("fish")
    );
  }

  return {
    calories,
    bmi,
    breakfast,
    lunch,
    dinner,
  };
};

const buildDeveloperPrompt = (profile, initialPlan) => {
  return `
You are a professional AI Diet Assistant inside SmartDiet Hub.

Your role:
- behave like a helpful, natural chatbot
- speak clearly and professionally
- give food, nutrition, hydration, meal timing, and healthy habit advice
- use the user's profile and initial diet plan as permanent context
- avoid unsafe medical claims
- when needed, suggest consulting a dietician for serious conditions
- keep answers practical and personalized

User profile:
- Age: ${profile.age || "N/A"}
- Gender: ${profile.gender || "N/A"}
- Height: ${profile.height || "N/A"} cm
- Weight: ${profile.weight || "N/A"} kg
- Goal: ${profile.goal || "N/A"}
- Food Preference: ${profile.foodPreference || "N/A"}
- Allergies: ${profile.allergies || "N/A"}
- Allergy Details: ${profile.allergyDetails || "N/A"}
- Medical Conditions: ${profile.medicalConditions || "N/A"}
- Medications: ${profile.medications || "N/A"}
- Meals Per Day: ${profile.mealsPerDay || "N/A"}
- Exercise Level: ${profile.exerciseLevel || "N/A"}

Initial generated plan:
- Daily Calories: ${initialPlan.calories}
- BMI: ${initialPlan.bmi}
- Breakfast: ${initialPlan.breakfast.join(", ")}
- Lunch: ${initialPlan.lunch.join(", ")}
- Dinner: ${initialPlan.dinner.join(", ")}

Rules:
- answer as a real chatbot, not as a JSON API
- remember the user profile throughout the conversation
- prefer concise but helpful responses
- if user asks for meal changes, adapt the current plan
- if user asks follow-up questions, continue naturally
`;
};

export const startAiSession = async (req, res) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      goal,
      foodPreference,
      allergies,
      allergyDetails,
      medicalConditions,
      medications,
      mealsPerDay,
      exerciseLevel,
    } = req.body;

    if (!age || !gender || !height || !weight || !goal || !foodPreference) {
      return res.status(400).json({
        success: false,
        message: "Required profile fields are missing",
      });
    }

    const profile = {
      age,
      gender,
      height,
      weight,
      goal,
      foodPreference,
      allergies: allergies || "No",
      allergyDetails: allergyDetails || "",
      medicalConditions: medicalConditions || "",
      medications: medications || "",
      mealsPerDay: mealsPerDay || "",
      exerciseLevel: exerciseLevel || "",
    };

    const initialPlan = buildInitialPlan(profile);

    const developerPrompt = buildDeveloperPrompt(profile, initialPlan);

    const session = await AiChatSession.create({
      user: req.user._id,
      profile,
      initialPlan,
      messages: [
        {
          role: "developer",
          content: developerPrompt,
        },
        {
          role: "assistant",
          content: `Hi! I’m your AI Diet Assistant. I’ve created your initial diet plan based on your details. Your BMI is ${initialPlan.bmi} and your target daily calories are ${initialPlan.calories}. You can now ask me anything about meals, timings, substitutions, hydration, or your diet plan.`,
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "AI session started successfully",
      sessionId: session._id,
      profile: session.profile,
      initialPlan: session.initialPlan,
      assistantMessage:
        session.messages[session.messages.length - 1].content,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const chatWithAi = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: "sessionId and message are required",
      });
    }

    const session = await AiChatSession.findOne({
      _id: sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "AI session not found",
      });
    }

    session.messages.push({
      role: "user",
      content: message,
    });

    const openAiMessages = session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openAiMessages,
      temperature: 0.7,
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a reply.";

    session.messages.push({
      role: "assistant",
      content: reply,
    });

    await session.save();

    return res.status(200).json({
      success: true,
      reply,
      sessionId: session._id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAiSessionHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await AiChatSession.findOne({
      _id: sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "AI session not found",
      });
    }

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};