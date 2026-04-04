import express from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  getMe,
  updateMe,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { avatarUpload } from "../middlewares/imageUpload.js";

const router = express.Router();

// ===== Email / password auth =====
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/me", protect, avatarUpload.single("avatar"), updateMe);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// ===== Google OAuth =====
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  (req, res) => {
    // later JWT set pannalaam; ippo frontend home-ku
    res.redirect("http://localhost:3000");
  }
);

export default router;
