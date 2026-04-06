import Booking from "../models/Booking.js";
import { generateFromEnv } from "../utils/jitsiJwt.js";
import sendEmail from "../utils/sendEmail.js";
import { buildBookingTimingResponse, getBookingWindowState } from "../utils/bookingSchedule.js";

const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const BOOKING_PAYMENT_STATUSES = ["pending", "paid"];
const JITSI_DOMAIN = process.env.JITSI_DOMAIN || "meet.jit.si";
const JITSI_ROOM_PREFIX = String(process.env.JITSI_ROOM_PREFIX || "").trim();
const JITSI_APP_ID = String(process.env.JITSI_APP_ID || process.env.JITSI_JWT_SUBJECT || "").trim();
const JITSI_REQUIRE_JWT = String(process.env.JITSI_REQUIRE_JWT ?? "true").trim().toLowerCase() === "true";

const normalizeConsultationMode = (mode) => {
  const value = String(mode || "").trim().toLowerCase();
  if (value === "chat") return "chat";
  if (value === "voice") return "voice";
  if (value === "video") return "video";
  return "consultation";
};

const sendDieticianPaidBookingAlert = async (bookingDoc) => {
  try {
    const booking = await Booking.findById(bookingDoc._id)
      .populate("user", "username email")
      .populate("dietician", "username email");

    const dieticianEmail = booking?.dietician?.email;
    if (!dieticianEmail) return;

    const modeLabel = normalizeConsultationMode(booking?.mode);
    const readableMode = modeLabel === "consultation" ? "consultation" : `${modeLabel} consultation`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin: 0 0 12px; color: #8b0c2e;">New Paid Booking Alert</h2>
        <p>Hello ${booking?.dietician?.username || "Dietician"},</p>
        <p>A customer has completed payment for a ${readableMode} booking.</p>
        <ul style="padding-left: 18px;">
          <li><strong>Client:</strong> ${booking?.user?.username || "-"} (${booking?.user?.email || "-"})</li>
          <li><strong>Date:</strong> ${booking?.date || "-"}</li>
          <li><strong>Time:</strong> ${booking?.time || "-"}</li>
          <li><strong>Mode:</strong> ${booking?.mode || "-"}</li>
          <li><strong>Booking ID:</strong> ${booking?._id || "-"}</li>
        </ul>
        <p>Please open your dashboard and approve the booking to unlock communication.</p>
      </div>
    `;

    await sendEmail({
      to: dieticianEmail,
      subject: "New paid consultation booking",
      html,
    });
  } catch (error) {
    console.error("Dietician paid booking email failed:", error?.message || error);
  }
};

const sendCustomerApprovalAlert = async (bookingDoc) => {
  try {
    const booking = await Booking.findById(bookingDoc._id)
      .populate("user", "username email")
      .populate("dietician", "username email");

    const customerEmail = booking?.user?.email;
    if (!customerEmail) return;

    const modeLabel = normalizeConsultationMode(booking?.mode);
    const readableMode = modeLabel === "consultation" ? "consultation" : `${modeLabel} consultation`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin: 0 0 12px; color: #8b0c2e;">Your Booking Was Approved</h2>
        <p>Hello ${booking?.user?.username || "Customer"},</p>
        <p>Your dietician has approved your ${readableMode} booking. You can now continue from your dashboard.</p>
        <ul style="padding-left: 18px;">
          <li><strong>Dietician:</strong> ${booking?.dietician?.username || "-"} (${booking?.dietician?.email || "-"})</li>
          <li><strong>Date:</strong> ${booking?.date || "-"}</li>
          <li><strong>Time:</strong> ${booking?.time || "-"}</li>
          <li><strong>Mode:</strong> ${booking?.mode || "-"}</li>
          <li><strong>Booking ID:</strong> ${booking?._id || "-"}</li>
        </ul>
        <p>If your booking mode is chat, use chat from dashboard. If your booking mode is voice/video, use call from dashboard.</p>
      </div>
    `;

    await sendEmail({
      to: customerEmail,
      subject: "Your consultation booking is approved",
      html,
    });
  } catch (error) {
    console.error("Customer approval email failed:", error?.message || error);
  }
};

const buildExternalRoomName = (baseRoomName) => {
  if (!JITSI_REQUIRE_JWT || !JITSI_APP_ID) {
    return baseRoomName;
  }

  const appPrefix = `${JITSI_APP_ID}/`;
  return baseRoomName.startsWith(appPrefix) ? baseRoomName : `${appPrefix}${baseRoomName}`;
};

const getWindowDeniedMessage = (windowState) => {
  const formatDuration = (totalMinutes) => {
    const safeMinutes = Math.max(0, Math.ceil(Number(totalMinutes || 0)));
    const days = Math.floor(safeMinutes / 1440);
    const hours = Math.floor((safeMinutes % 1440) / 60);
    const minutes = safeMinutes % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

    return parts.join(" ");
  };

  if (!windowState?.valid) {
    return "Booking date/time is invalid";
  }

  if (windowState.hasEnded) {
    return "This consultation slot has finished";
  }

  if (windowState.state === "countdown") {
    return `Consultation opens in ${formatDuration(windowState.minutesUntilStart)}`;
  }

  return "This consultation opens 10 minutes before the booking time";
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
      reminder30MinSentToUser: false,
      reminder30MinSentToDietician: false,
      reminder30MinSentAt: null,
      sessionCompletedAt: null,
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

    const enrichedBookings = bookings.map((booking) => ({
      ...booking.toObject(),
      sessionWindow: buildBookingTimingResponse(booking),
    }));

    res.json(enrichedBookings);
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

    const windowState = getBookingWindowState(booking);
    if (windowState.hasEnded) {
      return res.status(400).json({ message: "Cannot pay for a finished consultation slot" });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.dieticianAlertSeen = false; // trigger alert on dietician dashboard
    booking.reminder30MinSentToUser = false;
    booking.reminder30MinSentToDietician = false;
    booking.reminder30MinSentAt = null;
    booking.sessionCompletedAt = null;

    await booking.save();
    await sendDieticianPaidBookingAlert(booking);

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

    const enrichedBookings = bookings.map((booking) => ({
      ...booking.toObject(),
      sessionWindow: buildBookingTimingResponse(booking),
    }));

    res.json(enrichedBookings);
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
    const booking = await Booking.findById(req.params.bookingId)
      .populate("user", "username email")
      .populate("dietician", "username email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bookingDieticianId = booking?.dietician?._id?.toString?.() || booking?.dietician?.toString?.();

    if (!bookingDieticianId || bookingDieticianId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Cannot approve unpaid booking" });
    }

    const windowState = getBookingWindowState(booking);
    if (windowState.hasEnded) {
      return res.status(400).json({ message: "Cannot approve a finished consultation slot" });
    }

    if (booking.dieticianApproved) {
      return res.json({
        message: "Booking already approved.",
        booking,
      });
    }

    booking.dieticianApproved = true;
    booking.status = "confirmed";
    booking.reminder30MinSentToUser = false;
    booking.reminder30MinSentToDietician = false;
    booking.reminder30MinSentAt = null;
    booking.sessionCompletedAt = null;
    await booking.save();
    await sendCustomerApprovalAlert(booking);

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

    const requestedType = String(req.query?.type || "").trim().toLowerCase();
    const bookingMode = String(booking.mode || "").trim().toLowerCase();

    if (requestedType === "chat" && bookingMode !== "chat") {
      return res.status(403).json({ message: "Chat is not enabled for this booking mode" });
    }

    if (requestedType === "call" && bookingMode === "chat") {
      return res.status(403).json({ message: "Call is not enabled for this booking mode" });
    }

    const windowState = getBookingWindowState(booking);
    if (!windowState.valid || !windowState.canJoin || windowState.hasEnded) {
      const statusCode = windowState?.hasEnded ? 400 : 403;
      return res.status(statusCode).json({
        message: getWindowDeniedMessage(windowState),
        sessionWindow: buildBookingTimingResponse(booking),
      });
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
      sessionWindow: buildBookingTimingResponse(booking),
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

    const wasApproved = Boolean(booking.dieticianApproved);

    if (dieticianApproved !== undefined) {
      booking.dieticianApproved = dieticianApproved;
      if (dieticianApproved && booking.status === "pending") {
        booking.status = "confirmed";
      }

      if (dieticianApproved) {
        booking.reminder30MinSentToUser = false;
        booking.reminder30MinSentToDietician = false;
        booking.reminder30MinSentAt = null;
      }
    }

    if (status === "completed" && !booking.sessionCompletedAt) {
      booking.sessionCompletedAt = new Date();
    }

    await booking.save();

    if (!wasApproved && booking.dieticianApproved) {
      await sendCustomerApprovalAlert(booking);
    }

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};