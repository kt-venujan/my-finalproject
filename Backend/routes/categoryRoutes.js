import express from "express";
import {
  createCategory,
  getCategories,
  deleteCategory,
} from "../controllers/categoryController.js";

import { protect } from "../middlewares/authMiddleware.js";
import allowRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ADMIN CREATE
router.post("/", protect, allowRoles("admin"), createCategory);

// PUBLIC GET
router.get("/", getCategories);

router.delete("/:id", protect, allowRoles("admin"), deleteCategory);

export default router;