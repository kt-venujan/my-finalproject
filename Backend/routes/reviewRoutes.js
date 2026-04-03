import express from "express";
import { submitReview, getDieticianReviews } from "../controllers/reviewController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// USER — submit review after consultation
router.post("/", protect, submitReview);

// PUBLIC — get reviews for a dietician profile
router.get("/:profileId", getDieticianReviews);

export default router;
