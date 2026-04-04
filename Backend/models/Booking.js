import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
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
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    // payment ok ஆன பிறகு மட்டும் dietician dashboard alert காட்ட
    dieticianAlertSeen: {
      type: Boolean,
      default: true,
    },

    // dietician manually approves after reviewing the paid booking
    dieticianApproved: {
      type: Boolean,
      default: false,
    },

    // has user submitted a review for this booking
    reviewSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);