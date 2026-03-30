import express from "express";
import {
  startAiSession,
  chatWithAi,
  getAiSessionHistory,
} from "../controllers/aiController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Step 1: first question answers submit
router.post("/start", protect, startAiSession);

// Step 2: real chatbot message send
router.post("/chat", protect, chatWithAi);

// Step 3: load previous chat
router.get("/history/:sessionId", protect, getAiSessionHistory);

export default router;