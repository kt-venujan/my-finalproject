import express from "express";
import { sendMessage, getChat } from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:bookingId", protect, getChat);

export default router;