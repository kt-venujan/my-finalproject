import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  register,
  login,
  logout,
  getMe,
  updateMe,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  sendDeleteAccountOtp,
  deleteAccountWithOtp,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { avatarUpload } from "../middlewares/imageUpload.js";

const router = express.Router();

const normalizeOrigin = (value) => {
  if (!value) return null;
  try {
    return new URL(String(value)).origin;
  } catch {
    return null;
  }
};

const getAllowedFrontendOrigins = () => {
  const configuredOrigin = normalizeOrigin(process.env.FRONTEND_URL);
  const defaultOrigins = ["http://localhost:3000", "http://localhost:3001"];
  const originSet = new Set([...defaultOrigins, configuredOrigin].filter(Boolean));
  return Array.from(originSet);
};

const resolveFrontendOrigin = (candidateOrigin) => {
  const allowedOrigins = getAllowedFrontendOrigins();
  const normalizedCandidate = normalizeOrigin(candidateOrigin);

  if (normalizedCandidate && allowedOrigins.includes(normalizedCandidate)) {
    return normalizedCandidate;
  }

  return normalizeOrigin(process.env.FRONTEND_URL) || "http://localhost:3000";
};

const buildOAuthFailureUrl = (frontendOrigin, reason) => {
  const query = new URLSearchParams({ oauth: "failed" });
  if (reason) {
    query.set("reason", reason);
  }

  return `${frontendOrigin}/login?${query.toString()}`;
};

const mapOAuthErrorReason = (error) => {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("client secret is invalid")) {
    return "invalid_client_secret";
  }

  if (message.includes("redirect_uri_mismatch")) {
    return "redirect_uri_mismatch";
  }

  if (message.includes("invalid_client")) {
    return "invalid_client";
  }

  return "oauth_error";
};

// ===== Email / password auth =====
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/me", protect, avatarUpload.single("avatar"), updateMe);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.post("/delete-account/send-otp", protect, sendDeleteAccountOtp);
router.delete("/delete-account", protect, deleteAccountWithOtp);

// ===== Google OAuth =====
router.get("/google", (req, res, next) => {
  const frontendOrigin = resolveFrontendOrigin(req.query.origin);

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: frontendOrigin,
  })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  const frontendOrigin = resolveFrontendOrigin(req.query.state);

  passport.authenticate("google", (error, user) => {
    if (error) {
      const reason = mapOAuthErrorReason(error);
      return res.redirect(buildOAuthFailureUrl(frontendOrigin, reason));
    }

    if (!user) {
      return res.redirect(buildOAuthFailureUrl(frontendOrigin, "oauth_denied"));
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

    return res.redirect(
      `${frontendOrigin}/auth/google/callback?token=${encodeURIComponent(token)}`
    );
  })(req, res, next);
});

export default router;
