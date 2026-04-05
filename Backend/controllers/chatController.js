import Chat from "../models/Chat.js";
import Booking from "../models/Booking.js";

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();
  if (value === "dietitian") return "dietician";
  if (value === "customer") return "user";
  return value;
};

const ensureBookingAccess = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    const err = new Error("Booking not found");
    err.status = 404;
    throw err;
  }

  const currentUserId = user?._id?.toString();
  const bookingUserId = booking.user?.toString();
  const bookingDieticianId = booking.dietician?.toString();
  const isAdmin = normalizeRole(user?.role) === "admin";
  const isParticipant =
    Boolean(currentUserId) &&
    (currentUserId === bookingUserId || currentUserId === bookingDieticianId || isAdmin);

  if (!isParticipant) {
    const err = new Error("Access denied");
    err.status = 403;
    throw err;
  }

  if (booking.status === "cancelled") {
    const err = new Error("Cancelled bookings cannot use chat");
    err.status = 400;
    throw err;
  }

  if (booking.paymentStatus !== "paid") {
    const err = new Error("Booking payment is pending");
    err.status = 400;
    throw err;
  }

  if (!booking.dieticianApproved) {
    const err = new Error("Dietician has not approved this booking yet");
    err.status = 403;
    throw err;
  }

  return booking;
};

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const bookingId = String(req.body?.bookingId || "").trim();
    const message = String(req.body?.message || "").trim();

    if (!bookingId || !message) {
      return res.status(400).json({ message: "bookingId and message are required" });
    }

    if (message.length > 2000) {
      return res.status(400).json({ message: "Message exceeds 2000 characters" });
    }

    await ensureBookingAccess(bookingId, req.user);

    const msg = await Chat.create({
      booking: bookingId,
      sender: req.user._id,
      message,
    });

    const populated = await msg.populate("sender", "username role");

    return res.status(201).json(populated);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Failed to send message" });
  }
};

// GET CHAT
export const getChat = async (req, res) => {
  try {
    const bookingId = String(req.params?.bookingId || "").trim();

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    await ensureBookingAccess(bookingId, req.user);

    const messages = await Chat.find({ booking: bookingId })
      .populate("sender", "username role")
      .sort({ createdAt: 1 });

    return res.json(messages);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Failed to load chat" });
  }
};