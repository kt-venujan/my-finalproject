import Booking from "../models/Booking.js";

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const booking = await Booking.create({
      user: req.user._id,
      dietician: req.body.dieticianId,
      date: req.body.date,
      time: req.body.time,
      mode: req.body.mode,
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MY BOOKINGS
export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("dietician", "username");

  res.json(bookings);
};