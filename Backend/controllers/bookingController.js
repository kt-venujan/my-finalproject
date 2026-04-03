import Booking from "../models/Booking.js";

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    console.log("Creating booking...");
    console.log("User:", req.user._id);
    console.log("Dietician ID:", req.body.dieticianId);

    const booking = await Booking.create({
      user: req.user._id,
      dietician: req.body.dieticianId,
      date: req.body.date,
      time: req.body.time,
      mode: req.body.mode,
      status: "pending",
      paymentStatus: "pending", // ✅ FIXED
      dieticianAlertSeen: true, // ✅ FIXED
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

    // ✅ Safe compare
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (booking.paymentStatus === "paid") {
      return res.json({
        message: "Booking already paid",
        booking,
      });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.dieticianAlertSeen = false;

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
    console.log("Logged dietician:", req.user._id); // 🔥 IMPORTANT DEBUG

    const bookings = await Booking.find({
      dietician: req.user._id,
      paymentStatus: "paid",
    })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    console.log("Bookings found:", bookings.length); // 🔥 DEBUG

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

    res.json({
      message: "Alert marked as seen",
      booking,
    });
  } catch (err) {
    console.error("Alert Seen Error:", err);
    res.status(500).json({ message: err.message });
  }
};