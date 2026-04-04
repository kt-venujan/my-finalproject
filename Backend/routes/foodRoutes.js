import express from "express";
import {
  createFood,
  getFoods,
  deleteFood,
  updateFood,
} from "../controllers/foodController.js";

import { protect } from "../middlewares/authMiddleware.js";
import allowRoles from "../middlewares/roleMiddleware.js";
import { foodUpload } from "../middlewares/imageUpload.js";

const router = express.Router();

//  CREATE FOOD (admin)
router.post(
  "/admin/foods",
  protect,
  allowRoles("admin"),
  foodUpload.single("image"),
  createFood
);

router.put(
  "/admin/foods/:id",
  protect,
  allowRoles("admin"),
  foodUpload.single("image"),
  updateFood
);

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