import express from "express";
import {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory,
} from "../controllers/categoryController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";


const router = express.Router();

// ADMIN CREATE
router.post(
  "/create",
  protect,
  adminOnly,
  createCategory
);

// PUBLIC GET
router.get("/", getCategories);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateCategory
);

router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;