import mongoose from "mongoose";

const preferredMealTimeSchema = new mongoose.Schema(
  {
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "snack", "dinner"],
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const kitchenRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // basic info
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },

    // ✅ 5 important health questions
    goal: {
      type: String,
      required: true,
    }, // weight loss / diabetic control / muscle gain etc.

    medicalConditions: {
      type: [String],
      default: [],
    }, // diabetes, PCOS, BP...

    currentMedications: {
      type: String,
      default: "",
    },

    dietaryRestrictions: {
      type: [String],
      default: [],
    }, // low sugar, low salt, gluten-free...

    digestiveIssues: {
      type: String,
      default: "",
    }, // bloating, acidity, constipation...

    // allergy section
    hasAllergies: {
      type: Boolean,
      default: false,
    },

    allergyFoods: {
      type: [String],
      default: [],
    },

    allergyNotes: {
      type: String,
      default: "",
    },

    allergyReportUrl: {
      type: String,
      default: "",
    },

    // package / service requirement
    foodPreference: {
      type: String,
      enum: ["veg", "non-veg", "vegan", "other"],
      required: true,
    },

    mealsPerDay: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },

    numberOfDays: {
      type: Number,
      required: true,
      min: 1,
    },

    packageType: {
      type: String,
      enum: ["weekly", "monthly", "custom"],
      required: true,
    },

    deliveryStartDate: {
      type: Date,
      required: true,
    },

    preferredMealTimes: {
      type: [preferredMealTimeSchema],
      default: [],
    },

    deliveryAddress: {
      type: String,
      required: true,
    },

    additionalNotes: {
      type: String,
      default: "",
    },

    // request status
    status: {
      type: String,
      enum: ["pending", "reviewing", "approved", "rejected", "active", "completed"],
      default: "pending",
    },

    kitchenNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const KitchenRequest = mongoose.model("KitchenRequest", kitchenRequestSchema);

export default KitchenRequest;