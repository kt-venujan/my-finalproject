import express from "express";
import { generateDietPlan } from "../controllers/aiController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/generate", generateDietPlan);

export default router;