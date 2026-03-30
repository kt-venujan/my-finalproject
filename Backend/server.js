import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();

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
    origin: "http://localhost:3000",
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

// server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});