import express from "express";
import {
  getAllUsers,
  getUser,
  updateUser,
  createUser,
  deleteUser
} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// READ ALL
router.get("/users", protect, adminOnly, getAllUsers);

// READ ONE
router.get("/users/:id", protect, adminOnly, getUser);

// CREATE
router.post("/users", protect, adminOnly, createUser);

// UPDATE
router.put("/users/:id", protect, adminOnly, updateUser);

// DELETE
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;