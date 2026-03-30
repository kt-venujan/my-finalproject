import express from "express";
import {
  createFood,
  getFoods,
  deleteFood,
} from "../controllers/foodController.js";

import { protect } from "../middlewares/authMiddleware.js";
import allowRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

//  CREATE FOOD (admin)
router.post("/admin/foods", protect, allowRoles("admin"), createFood);

// GET FOODS (user)
router.get("/foods", getFoods);

//  DELETE FOOD (FIX HERE )
router.delete(
  "/admin/foods/:id",
  protect,
  allowRoles("admin"),
  deleteFood
);

export default router;