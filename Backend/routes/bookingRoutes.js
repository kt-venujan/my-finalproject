import express from "express";
import {
  createBooking,
  getMyBookings,
  markBookingPaid,
  getDieticianBookings,
  markDieticianAlertSeen,
} from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";
import allowRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);

// user payment success update
router.put("/:bookingId/pay", protect, markBookingPaid);

// dietician dashboard bookings
router.get("/dietician/my", protect, allowRoles("dietician"), getDieticianBookings);

// dietician alert seen
router.put(
  "/:bookingId/alert-seen",
  protect,
  allowRoles("dietician"),
  markDieticianAlertSeen
);

export default router;