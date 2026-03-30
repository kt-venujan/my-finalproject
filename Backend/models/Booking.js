import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  dietician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  date: String,
  time: String,

  mode: {
    type: String,
    enum: ["video", "voice", "chat"],
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "completed"],
    default: "pending",
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);