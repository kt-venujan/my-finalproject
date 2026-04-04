import express from "express";
import {
  createCheckoutSession,
  confirmCheckout,
  createCashOrder,
  getMyKitchenOrders,
  getAllKitchenOrders,
  updateKitchenOrderStatus,
  getSavedCards,
  deleteSavedCard,
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import allowRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/stripe/create-checkout-session",
  protect,
  allowRoles("user"),
  createCheckoutSession
);

router.get(
  "/stripe/confirm",
  protect,
  allowRoles("user"),
  confirmCheckout
);

router.post("/orders/cash", protect, allowRoles("user"), createCashOrder);
router.get(
  "/orders/my",
  protect,
  allowRoles("user", "dietician", "kitchen", "admin"),
  getMyKitchenOrders
);
router.get(
  "/orders/admin/all",
  protect,
  allowRoles("admin", "kitchen"),
  getAllKitchenOrders
);
router.put(
  "/orders/:orderId/status",
  protect,
  allowRoles("admin", "kitchen"),
  updateKitchenOrderStatus
);

router.get(
  "/payment-methods",
  protect,
  allowRoles("user", "dietician", "kitchen", "admin"),
  getSavedCards
);
router.delete(
  "/payment-methods/:id",
  protect,
  allowRoles("user", "dietician", "kitchen", "admin"),
  deleteSavedCard
);

export default router;
