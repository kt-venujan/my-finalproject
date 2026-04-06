import Review from "../models/Review.js";
import DieticianProfile from "../models/DieticianProfile.js";
import Booking from "../models/Booking.js";
import { getBookingWindowState } from "../utils/bookingSchedule.js";

// ============================================================
// SUBMIT REVIEW
// ============================================================
export const submitReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: "bookingId and rating are required" });
    }

    // Verify booking belongs to user & is completed & approved
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your booking" });
    }
    if (!booking.dieticianApproved) {
      return res.status(400).json({ message: "Booking not yet approved" });
    }

    const windowState = getBookingWindowState(booking);
    if (!windowState.hasEnded) {
      return res.status(400).json({
        message: "You can submit a review only after the consultation slot is finished",
      });
    }

    if (booking.reviewSubmitted) {
      return res.status(400).json({ message: "Review already submitted" });
    }

    // Find dietician profile by User id
    const profile = await DieticianProfile.findOne({ user: booking.dietician });
    if (!profile) return res.status(404).json({ message: "Dietician profile not found" });

    // Create review
    const review = await Review.create({
      user: req.user._id,
      dietician: profile._id,
      booking: bookingId,
      rating: Number(rating),
      comment: comment || "",
    });

    // Update dietician's avg rating
    const allReviews = await Review.find({ dietician: profile._id });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    profile.rating = Math.round(avgRating * 10) / 10;
    profile.reviewCount = allReviews.length;
    await profile.save();

    // Mark booking as review submitted
    booking.reviewSubmitted = true;
    await booking.save();

    res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
    console.error("Submit Review Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// GET REVIEWS FOR A DIETICIAN (by profile id)
// ============================================================
export const getDieticianReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ dietician: req.params.profileId })
      .populate("user", "username")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
