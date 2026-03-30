import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  message: String,
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);