import mongoose from "mongoose";

const dieticianProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  specialization: {
    type: String,
    required: true,
  },

  bio: {
    type: String,
    default: "",
  },

  experience: {
    type: Number,
    default: 0,
  },

  price: {
    type: Number,
    default: 1500,
  },

  avatar: {
    type: String,
    default: "",
  },

  certificateUrl: String, // PDF/image upload

  certificateStatus: {
    type: String,
    enum: ["not_uploaded", "pending", "approved", "rejected"],
    default: "not_uploaded",
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  // Admin rejection reason
  rejectionReason: {
    type: String,
    default: "",
  },

  // Available time slots e.g. ["09:00", "10:00", "14:00"]
  availableSlots: {
    type: [String],
    default: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  },

  // Overall rating (updated when reviews are submitted)
  rating: {
    type: Number,
    default: 0,
  },

  reviewCount: {
    type: Number,
    default: 0,
  },

  isAvailable: {
    type: Boolean,
    default: true,
  },

}, { timestamps: true });

export default mongoose.model("DieticianProfile", dieticianProfileSchema);