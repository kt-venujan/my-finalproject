import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import DieticianProfile from "../models/DieticianProfile.js";
import Booking from "../models/Booking.js";
import KitchenOrder from "../models/KitchenOrder.js";
import KitchenRequest from "../models/KitchenRequest.js";
import Appointment from "../models/Appointment.js";
import Chat from "../models/Chat.js";
import Review from "../models/Review.js";
import AiChatSession from "../models/AiChatSession.js";
import CommunityPost from "../models/CommunityPost.js";
import CommunityProfile from "../models/CommunityProfile.js";
import CommunityConnection from "../models/CommunityConnection.js";

const ALLOWED_ROLES = ["user", "dietician", "kitchen", "admin"];
const OTP_EXPIRES_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_SALT = process.env.OTP_SECRET || process.env.JWT_SECRET || "dietara-otp";

const toSafeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  phone: user.phone || "",
  avatar: user.avatar || "",
  role: user.role,
});

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(`${otp}:${OTP_SALT}`)
    .digest("hex");
};

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();
  if (value === "customer") return "user";
  if (value === "dietitian") return "dietician";
  return value;
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, role, phone } = req.body;

    console.log("REGISTER BODY:", req.body);

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const requestedRole = normalizeRole(role);
    const safeRole = ALLOWED_ROLES.includes(requestedRole) ? requestedRole : "user";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      phone: phone || "",
      role: safeRole,
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role }, 
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      token,
      user: toSafeUser(newUser),
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN BODY:", req.body);

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      token,
      user: toSafeUser(user),
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================= CURRENT USER =================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, user: toSafeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PROFILE =================
export const updateMe = async (req, res) => {
  try {
    const { username, email, phone, removeAvatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username !== undefined) {
      const nextUsername = String(username).trim();

      if (nextUsername.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
      }

      const existingUsername = await User.findOne({ username: nextUsername });
      if (existingUsername && existingUsername._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Username already in use" });
      }

      user.username = nextUsername;
    }

    if (email !== undefined) {
      const nextEmail = String(email).trim().toLowerCase();
      if (nextEmail && nextEmail !== String(user.email || "").trim().toLowerCase()) {
        return res.status(400).json({ message: "Email cannot be changed" });
      }
    }

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    if (removeAvatar === true || removeAvatar === "true") {
      user.avatar = "";
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: toSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= LOGOUT =================
export const logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully" });
};

export const sendDeleteAccountOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user.resetOtpLastSentAt &&
      Date.now() - new Date(user.resetOtpLastSentAt).getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another OTP.",
      });
    }

    const otp = generateOtp();
    user.resetOtpHash = hashOtp(otp);
    user.resetOtpExpires = Date.now() + OTP_EXPIRES_MS;
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = Date.now();
    await user.save();

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Delete Account OTP</h2>
        <p>You requested to permanently delete your Dietara Hub account.</p>
        <p>Your OTP code is:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #a4002c;">${otp}</p>
        <p style="margin-top:16px;">This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Delete Account OTP - Dietara Hub",
      html,
    });

    return res.status(200).json({ message: "Delete account OTP sent to your email." });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteAccountWithOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      !user.resetOtpHash ||
      !user.resetOtpExpires ||
      new Date(user.resetOtpExpires).getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if ((user.resetOtpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many invalid attempts. Request a new OTP." });
    }

    const expectedHash = hashOtp(String(otp).trim());
    if (expectedHash !== user.resetOtpHash) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const userId = user._id;

    const [profileDocs, bookingDocs] = await Promise.all([
      DieticianProfile.find({ user: userId }).select("_id"),
      Booking.find({ $or: [{ user: userId }, { dietician: userId }] }).select("_id"),
    ]);

    const profileIds = profileDocs.map((profile) => profile._id);
    const bookingIds = bookingDocs.map((booking) => booking._id);

    await Promise.all([
      Chat.deleteMany(bookingIds.length ? { booking: { $in: bookingIds } } : { _id: null }),
      Review.deleteMany(
        profileIds.length
          ? { $or: [{ user: userId }, { dietician: { $in: profileIds } }, { booking: { $in: bookingIds } }] }
          : bookingIds.length
            ? { $or: [{ user: userId }, { booking: { $in: bookingIds } }] }
            : { user: userId }
      ),
      DieticianProfile.deleteMany({ user: userId }),
      Booking.deleteMany({ $or: [{ user: userId }, { dietician: userId }] }),
      KitchenOrder.deleteMany({ user: userId }),
      KitchenRequest.deleteMany({ user: userId }),
      Appointment.deleteMany({ $or: [{ user: userId }, { dietician: userId }] }),
      AiChatSession.deleteMany({ user: userId }),
      CommunityPost.deleteMany({ author: userId }),
      CommunityProfile.deleteMany({ user: userId }),
      CommunityConnection.deleteMany({
        $or: [{ requester: userId }, { target: userId }],
      }),
      User.findByIdAndDelete(userId),
    ]);

    res.clearCookie("token");

    return res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("FORGOT PASSWORD BODY:", req.body);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });

    if (!user) {
      return res.status(200).json({
        message: "If that email is registered, an OTP has been sent.",
      });
    }

    if (
      user.resetOtpLastSentAt &&
      Date.now() - new Date(user.resetOtpLastSentAt).getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another OTP.",
      });
    }

    const otp = generateOtp();
    user.resetOtpHash = hashOtp(otp);
    user.resetOtpExpires = Date.now() + OTP_EXPIRES_MS;
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = Date.now();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset OTP</h2>
        <p>You requested a password reset for your Dietara Hub account.</p>
        <p>Your OTP code is:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #a4002c;">${otp}</p>
        <p style="margin-top:16px;">This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Reset Your Password - Dietara Hub",
      html,
    });

    return res.status(200).json({
      message: "Password reset OTP sent to your email.",
    });
  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= VERIFY RESET OTP =================
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });

    if (
      !user ||
      !user.resetOtpHash ||
      !user.resetOtpExpires ||
      new Date(user.resetOtpExpires).getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if ((user.resetOtpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many invalid attempts. Request a new OTP." });
    }

    const expectedHash = hashOtp(String(otp).trim());

    if (expectedHash !== user.resetOtpHash) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.status(200).json({ success: true, message: "OTP verified" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, token, newPassword } = req.body;

    console.log("RESET PASSWORD BODY:", req.body);

    if (!email || !newPassword || (!otp && !token)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    let user;

    if (token) {
      user = await User.findOne({
        email: normalizedEmail,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
    } else {
      user = await User.findOne({ email: normalizedEmail });

      if (
        !user ||
        !user.resetOtpHash ||
        !user.resetOtpExpires ||
        new Date(user.resetOtpExpires).getTime() < Date.now()
      ) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      if ((user.resetOtpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
        return res.status(429).json({ message: "Too many invalid attempts. Request a new OTP." });
      }

      const expectedHash = hashOtp(String(otp).trim());
      if (expectedHash !== user.resetOtpHash) {
        user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
        await user.save();
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetOtpHash = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};