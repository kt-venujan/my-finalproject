import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    password: {
      type: String,
    },

    googleId: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "dietician", "kitchen", "admin"], // ✅ FIXED
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔐 Password reset (token based)
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },

    // 🔐 OTP-based reset
    resetOtpHash: {
      type: String,
    },
    resetOtpExpires: {
      type: Date,
    },
    resetOtpAttempts: {
      type: Number,
      default: 0,
    },
    resetOtpLastSentAt: {
      type: Date,
    },

    savedCards: [
      {
        brand: { type: String, default: "" },
        last4: { type: String, default: "" },
        expMonth: { type: Number },
        expYear: { type: Number },
        paymentMethodId: { type: String, default: "" },
        savedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;