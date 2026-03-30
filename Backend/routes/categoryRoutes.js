import express from "express";
import {
  createCategory,
  getCategories,
  deleteCategory,
} from "../controllers/categoryController.js";

import allowRoles from "../middlewares/roleMiddleware.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";


const router = express.Router();

// ADMIN CREATE
router.post("/create", protect, adminOnly, createCategory);

// PUBLIC GET
router.get("/", getCategories);

router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;