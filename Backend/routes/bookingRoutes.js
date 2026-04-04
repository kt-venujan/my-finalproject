import express from "express";
import {
  createBooking,
  getMyBookings,
  markBookingPaid,
  getDieticianBookings,
  markDieticianAlertSeen,
  approveBooking,
  getAllBookingsForAdmin,
  updateBookingByAdmin,
} from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";
import allowRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

// USER — create booking
router.post("/", protect, createBooking);

// USER — get own bookings
router.get("/my", protect, getMyBookings);

// USER — mark payment paid
router.put("/:bookingId/pay", protect, markBookingPaid);

// DIETICIAN — get paid bookings
router.get("/dietician/my", protect, allowRoles("dietician"), getDieticianBookings);

// DIETICIAN — mark alert seen
router.put("/:bookingId/alert-seen", protect, allowRoles("dietician"), markDieticianAlertSeen);

// DIETICIAN — approve booking (unlocks Call/Chat)
router.put("/:bookingId/approve", protect, allowRoles("dietician"), approveBooking);

// ADMIN — manage all bookings
router.get("/admin/all", protect, allowRoles("admin"), getAllBookingsForAdmin);
router.put("/admin/:bookingId", protect, allowRoles("admin"), updateBookingByAdmin);

export default router;