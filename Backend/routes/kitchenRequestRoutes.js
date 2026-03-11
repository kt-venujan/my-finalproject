import express from "express";
import {
  createKitchenRequest,
  getMyKitchenRequests,
  getAllKitchenRequests,
  getKitchenRequestById,
  updateKitchenRequestStatus,
} from "../controllers/kitchenRequestController.js";

import { protect } from "../middlewares/authMiddleware.js";
import allowRoles from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// ✅ User submit kitchen request with optional allergy report
router.post(
  "/requests",
  protect,
  allowRoles("user"),
  upload.single("allergyReport"),
  createKitchenRequest
);

// ✅ User view own requests
router.get("/my-requests", protect, allowRoles("user"), getMyKitchenRequests);

// ✅ Kitchen/Admin/Dietician view all requests
router.get(
  "/requests",
  protect,
  allowRoles("kitchen", "admin", "dietician"),
  getAllKitchenRequests
);

// ✅ Kitchen/Admin/Dietician view single request
router.get(
  "/requests/:id",
  protect,
  allowRoles("kitchen", "admin", "dietician", "user"),
  getKitchenRequestById
);

// ✅ Kitchen/Admin update status
router.put(
  "/requests/:id/status",
  protect,
  allowRoles("kitchen", "admin"),
  updateKitchenRequestStatus
);

export default router;