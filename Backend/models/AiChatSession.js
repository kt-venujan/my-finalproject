import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "developer"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false, timestamps: true }
);

const aiChatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    profile: {
      age: String,
      gender: String,
      height: String,
      weight: String,
      goal: String,
      foodPreference: String,
      allergies: String,
      allergyDetails: String,
      medicalConditions: String,
      medications: String,
      mealsPerDay: String,
      exerciseLevel: String,
    },

    initialPlan: {
      calories: Number,
      bmi: Number,
      breakfast: [String],
      lunch: [String],
      dinner: [String],
    },

    messages: [messageSchema],
  },
  { timestamps: true }
);

const AiChatSession = mongoose.model("AiChatSession", aiChatSessionSchema);

export default AiChatSession;