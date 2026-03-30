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

  experience: Number,

  price: Number,

  certificateUrl: String, // PDF upload

  isVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model("DieticianProfile", dieticianProfileSchema);