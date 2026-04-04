import express from "express";
import {
  createProfile,
  getMyProfile,
  getDieticians,
  getAllDieticiansAdmin,
  approveCertificate,
  rejectCertificate,
  uploadCert,
} from "../controllers/dieticianController.js";
import { protect } from "../middlewares/authMiddleware.js";
import allowRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

// PUBLIC — get all verified/available dieticians
router.get("/", getDieticians);

// DIETICIAN — create / update own profile + upload certificate
router.post(
  "/",
  protect,
  allowRoles("dietician"),
  uploadCert,
  createProfile
);

// DIETICIAN — get own profile
router.get("/me", protect, allowRoles("dietician"), getMyProfile);

// ADMIN — get all dieticians (including unverified)
router.get("/admin/all", protect, allowRoles("admin"), getAllDieticiansAdmin);

// ADMIN — approve certificate
router.put("/admin/:profileId/approve", protect, allowRoles("admin"), approveCertificate);

// ADMIN — reject certificate
router.put("/admin/:profileId/reject", protect, allowRoles("admin"), rejectCertificate);

export default router;