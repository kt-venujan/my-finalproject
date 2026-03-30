import express from "express";
import { createProfile, getDieticians } from "../controllers/dieticianController.js";
import { protect } from "../middlewares/authMiddleware.js";
import allowRoles from "../middlewares/roleMiddleware.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// CREATE PROFILE (DIETICIAN ONLY)
router.post("/", protect, allowRoles("dietician"), upload.single("certificate"), createProfile);

// GET ALL
router.get("/", getDieticians);

export default router;