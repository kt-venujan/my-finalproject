import Booking from "../models/Booking.js";
import { generateFromEnv } from "../utils/jitsiJwt.js";

const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const BOOKING_PAYMENT_STATUSES = ["pending", "paid"];
const JITSI_DOMAIN = process.env.JITSI_DOMAIN || "meet.jit.si";
const JITSI_ROOM_PREFIX = String(process.env.JITSI_ROOM_PREFIX || "").trim();
const JITSI_APP_ID = String(process.env.JITSI_APP_ID || process.env.JITSI_JWT_SUBJECT || "").trim();
const JITSI_REQUIRE_JWT = String(process.env.JITSI_REQUIRE_JWT ?? "true").trim().toLowerCase() === "true";

const buildExternalRoomName = (baseRoomName) => {
  if (!JITSI_REQUIRE_JWT || !JITSI_APP_ID) {
    return baseRoomName;
  }

  const appPrefix = `${JITSI_APP_ID}/`;
  return baseRoomName.startsWith(appPrefix) ? baseRoomName : `${appPrefix}${baseRoomName}`;
};

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const dieticianId = req.body?.dieticianId || req.body?.dietitianId;

    if (!dieticianId) {
      return res.status(400).json({ message: "dieticianId is required" });
    }

    console.log("Creating booking...");
    console.log("User:", req.user._id);
    console.log("Dietician ID:", dieticianId);

    const booking = await Booking.create({
      user: req.user._id,
      dietician: dieticianId,
      date: req.body.date,
      time: req.body.time,
      mode: req.body.mode,
      status: "pending",
      paymentStatus: "pending",
      dieticianAlertSeen: true,
      dieticianApproved: false,
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error("Create Booking Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// USER - GET MY BOOKINGS
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("dietician", "username email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Get My Bookings Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// USER - MARK PAYMENT SUCCESS
export const markBookingPaid = async (req, res) => {
  try {
    console.log("Marking payment for booking:", req.params.bookingId);

    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (booking.paymentStatus === "paid") {
      return res.json({ message: "Booking already paid", booking });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.dieticianAlertSeen = false; // trigger alert on dietician dashboard

    await booking.save();

    console.log("Payment success:", booking._id);

    res.json({
      message: "Payment successful. Dietician alerted.",
      booking,
    });
  } catch (err) {
    console.error("Payment Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// DIETICIAN - GET MY PAID BOOKINGS
export const getDieticianBookings = async (req, res) => {
  try {
    console.log("Logged dietician:", req.user._id);

    const bookings = await Booking.find({
      dietician: req.user._id,
      paymentStatus: "paid",
    })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    console.log("Bookings found:", bookings.length);

    res.json(bookings);
  } catch (err) {
    console.error("Dietician Booking Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// DIETICIAN - MARK ALERT AS SEEN
export const markDieticianAlertSeen = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.dietician.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    booking.dieticianAlertSeen = true;
    await booking.save();

    res.json({ message: "Alert marked as seen", booking });
  } catch (err) {
    console.error("Alert Seen Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// DIETICIAN - APPROVE BOOKING (unlocks Call/Chat for both sides)
export const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("user", "username email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.dietician.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Cannot approve unpaid booking" });
    }

    booking.dieticianApproved = true;
    booking.status = "confirmed";
    await booking.save();

    res.json({
      message: "Booking approved. Call/Chat now unlocked.",
      booking,
    });
  } catch (err) {
    console.error("Approve Booking Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// USER/DIETICIAN - GET COMMUNICATION SESSION (Jitsi room details)
export const getBookingCommunicationSession = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("user", "username email")
      .populate("dietician", "username email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const currentUserId = req.user?._id?.toString();
    const userId = booking.user?._id?.toString() || booking.user?.toString();
    const dieticianId = booking.dietician?._id?.toString() || booking.dietician?.toString();
    const isAdmin = String(req.user?.role || "").trim().toLowerCase() === "admin";
    const isDieticianParticipant = Boolean(currentUserId && currentUserId === dieticianId);

    const isParticipant =
      currentUserId && (currentUserId === userId || currentUserId === dieticianId || isAdmin);

    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Cancelled bookings cannot start communication" });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Booking payment is pending" });
    }

    if (!booking.dieticianApproved) {
      return res.status(403).json({ message: "Dietician has not approved this booking yet" });
    }

    const safeBookingId = booking._id.toString().replace(/[^a-zA-Z0-9]/g, "");
    const baseRoomName = `dietara-booking-${safeBookingId}`;
    const roomName = JITSI_ROOM_PREFIX ? `${JITSI_ROOM_PREFIX}${baseRoomName}` : baseRoomName;
    const externalRoomName = buildExternalRoomName(roomName);
    const jitsiJwt = generateFromEnv({
      roomName: externalRoomName,
      user: req.user,
      isModerator: isDieticianParticipant || isAdmin,
    });

    return res.status(200).json({
      bookingId: booking._id,
      roomName: externalRoomName,
      jitsiDomain: JITSI_DOMAIN,
      jitsiJwt,
      jwtRequired: JITSI_REQUIRE_JWT,
      canModerate: isDieticianParticipant || isAdmin,
      date: booking.date,
      time: booking.time,
      mode: booking.mode,
      user: booking.user,
      dietician: booking.dietician,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllBookingsForAdmin = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "username email")
      .populate("dietician", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateBookingByAdmin = async (req, res) => {
  try {
    const { status, paymentStatus, dieticianApproved } = req.body;

    if (status && !BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    if (paymentStatus && !BOOKING_PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    if (
      dieticianApproved !== undefined &&
      typeof dieticianApproved !== "boolean"
    ) {
      return res.status(400).json({ message: "Invalid approval value" });
    }

    const booking = await Booking.findById(req.params.bookingId)
      .populate("user", "username email")
      .populate("dietician", "username email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (status) {
      booking.status = status;
    }

    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    if (dieticianApproved !== undefined) {
      booking.dieticianApproved = dieticianApproved;
      if (dieticianApproved && booking.status === "pending") {
        booking.status = "confirmed";
      }
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};