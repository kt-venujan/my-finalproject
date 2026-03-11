import express from "express";
import {
  getAllUsers,
  getUser,
  updateUser,
  createUser   // ✅ add this
} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// READ ALL
router.get("/users", protect, adminOnly, getAllUsers);

// READ ONE
router.get("/users/:id", protect, adminOnly, getUser);

// CREATE ✅ ADD THIS
router.post("/users", protect, adminOnly, createUser);

// UPDATE
router.put("/users/:id", protect, adminOnly, updateUser);

export default router;