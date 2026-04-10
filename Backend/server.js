import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config({ override: true });

import "./config/passport.js";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import kitchenRequestRoutes from "./routes/kitchenRequestRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import dieticianRoutes from "./routes/dieticianRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import bundleOfferRoutes from "./routes/bundleOfferRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import { startBookingReminderService } from "./services/bookingReminderService.js";

const normalizeOrigin = (value) => {
  if (!value) return null;

  try {
    return new URL(String(value)).origin;
  } catch {
    return null;
  }
};

const getAllowedOrigins = () => {
  const defaultOrigins = ["http://localhost:3000", "http://localhost:3001"];
  const configuredOrigins = String(process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean);

  const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL);

  return new Set([...defaultOrigins, frontendOrigin, ...configuredOrigins].filter(Boolean));
};

const allowedOrigins = getAllowedOrigins();





const app = express();

// connect database
connectDB();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (normalizedOrigin && allowedOrigins.has(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(helmet());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "smartdiet-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/kitchen", kitchenRequestRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", foodRoutes);
app.use("/api/dieticians", dieticianRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bundle-offers", bundleOfferRoutes);
app.use("/api/community", communityRoutes);

// server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startBookingReminderService();
});