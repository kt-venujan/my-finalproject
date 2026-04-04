"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import Link from "next/link";

type Booking = {
  _id: string;
  date: string;
  time: string;
  mode: string;
  status: string;
  paymentStatus: string;
  dieticianApproved: boolean;
  reviewSubmitted: boolean;
  dietician: { _id: string; username: string; email: string };
};

function RatingModal({
  booking,
  onClose,
  onSubmit,
}: {
  booking: Booking;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setLoading(true);
    try {
      await api.post("/reviews", { bookingId: booking._id, rating, comment });
      toast.success("⭐ Review submitted! Thank you.");
      onSubmit();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rm-modal">
        <button className="rm-close" onClick={onClose}>✕</button>
        <h2>Rate Your Consultation</h2>
        <p>with <strong>{booking.dietician?.username}</strong></p>

        <div className="rm-stars">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={`rm-star ${s <= (hovered || rating) ? "active" : ""}`}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
            >★</span>
          ))}
        </div>
        <p className="rm-rating-label">
          {rating === 0 ? "Select rating" : ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
        </p>

        <textarea
          className="rm-comment"
          placeholder="Share your experience (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />

        <button className="rm-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [active, setActive] = useState<"dashboard" | "bookings" | "tips">("dashboard");
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const approved = bookings.filter((b) => b.dieticianApproved).length;
  const pending = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="ud-wrapper">

      {/* SIDEBAR */}
      <nav className="ud-sidebar">
        <div className="ud-logo">Dietara</div>
        <ul className="ud-nav">
          {([
            { id: "dashboard", icon: "🏠", label: "Dashboard" },
            { id: "bookings", icon: "📅", label: "My Bookings", badge: pending },
            { id: "tips", icon: "💡", label: "Health Tips" },
          ] as const).map((item) => (
            <li
              key={item.id}
              className={active === item.id ? "ud-nav-item active" : "ud-nav-item"}
              onClick={() => setActive(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="ud-badge">{item.badge}</span>
              )}
            </li>
          ))}
        </ul>
        <div className="ud-sidebar-footer">
          <p className="ud-user-name">{user?.username}</p>
          <button className="ud-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="ud-main">

        {/* DASHBOARD */}
        {active === "dashboard" && (
          <div className="ud-section">
            <div className="ud-page-header">
              <h1>Welcome, {user?.username} 👋</h1>
              <p>Track your health journey</p>
            </div>

            <div className="ud-stats">
              <div className="ud-stat blue">
                <div className="ud-stat-icon">📅</div>
                <h3>{bookings.length}</h3>
                <p>Bookings</p>
              </div>
              <div className="ud-stat green">
                <div className="ud-stat-icon">✅</div>
                <h3>{approved}</h3>
                <p>Approved</p>
              </div>
              <div className="ud-stat orange">
                <div className="ud-stat-icon">⏳</div>
                <h3>{pending}</h3>
                <p>Pending</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="ud-quick">
              <h2>Quick Actions</h2>
              <div className="ud-quick-grid">
                <button className="ud-quick-btn" onClick={() => router.push("/dietician")}>
                  👩‍⚕️ Book Dietician
                </button>
                <button className="ud-quick-btn" onClick={() => router.push("/tracking")}>
                  📊 Track Weight
                </button>
                <button className="ud-quick-btn" onClick={() => router.push("/ai-assistant")}>
                  🤖 AI Assistant
                </button>
                <button className="ud-quick-btn" onClick={() => router.push("/kitchen")}>
                  🍲 Kitchen Menu
                </button>
              </div>
            </div>

            {/* Upcoming Bookings (snapshot) */}
            {bookings.slice(0, 2).length > 0 && (
              <div className="ud-upcoming">
                <h2>Upcoming Consultations</h2>
                {bookings.slice(0, 2).map((b) => (
                  <div key={b._id} className="ud-booking-mini">
                    <div>
                      <p><strong>{b.dietician?.username}</strong></p>
                      <p>{b.date} at {b.time} · {b.mode}</p>
                    </div>
                    <span className={`ud-pill ${b.status}`}>{b.status}</span>
                  </div>
                ))}
                <button className="ud-view-all-link" onClick={() => setActive("bookings")}>
                  View all →
                </button>
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS */}
        {active === "bookings" && (
          <div className="ud-section">
            <div className="ud-page-header">
              <h1>📅 My Bookings</h1>
              <button className="ud-new-booking-btn" onClick={() => router.push("/dietician")}>
                + New Booking
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="ud-empty">
                <p>No bookings yet.</p>
                <button onClick={() => router.push("/dietician")}>Book a Dietician</button>
              </div>
            ) : (
              <div className="ud-bookings-list">
                {bookings.map((b) => (
                  <div key={b._id} className={`ud-booking-card ${b.dieticianApproved ? "approved" : ""}`}>
                    <div className="ud-booking-top">
                      <div className="ud-booking-avatar">{b.dietician?.username?.[0]?.toUpperCase()}</div>
                      <div className="ud-booking-info">
                        <h3>{b.dietician?.username}</h3>
                        <p>📅 {b.date} &nbsp; ⏰ {b.time} &nbsp; 💬 {b.mode}</p>
                      </div>
                      <div className="ud-booking-pills">
                        <span className={`ud-pill ${b.paymentStatus}`}>{b.paymentStatus}</span>
                        <span className={`ud-pill ${b.status}`}>{b.status}</span>
                        {b.dieticianApproved && <span className="ud-pill approved">✅ Approved</span>}
                      </div>
                    </div>

                    <div className="ud-booking-actions">
                      {/* CALL / CHAT — only if dietician approved */}
                      {b.dieticianApproved ? (
                        <>
                          <button
                            className="ud-action-btn call"
                            onClick={() => router.push(`/call?bookingId=${b._id}`)}
                          >
                            📞 Call
                          </button>
                          <button
                            className="ud-action-btn chat"
                            onClick={() => router.push(`/chat?bookingId=${b._id}`)}
                          >
                            💬 Chat
                          </button>
                          {!b.reviewSubmitted && (
                            <button
                              className="ud-action-btn review"
                              onClick={() => setReviewBooking(b)}
                            >
                              ⭐ Rate
                            </button>
                          )}
                          {b.reviewSubmitted && (
                            <span className="ud-action-btn rated">✅ Rated</span>
                          )}
                        </>
                      ) : (
                        <p className="ud-waiting">
                          {b.paymentStatus === "paid"
                            ? "⏳ Waiting for dietician approval..."
                            : "💳 Payment required"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HEALTH TIPS */}
        {active === "tips" && (
          <div className="ud-section">
            <div className="ud-page-header">
              <h1>💡 Health Tips</h1>
            </div>
            <div className="ud-tips-grid">
              {[
                { icon: "💧", tip: "Drink at least 2L of water daily" },
                { icon: "🥗", tip: "Fill half your plate with vegetables" },
                { icon: "🚶", tip: "Walk 30 minutes every day" },
                { icon: "😴", tip: "Get 7–8 hours of quality sleep" },
                { icon: "🍎", tip: "Eat whole fruits instead of juice" },
                { icon: "🧘", tip: "Manage stress with meditation" },
              ].map((t, i) => (
                <div key={i} className="ud-tip-card">
                  <span className="ud-tip-icon">{t.icon}</span>
                  <p>{t.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* RATING MODAL */}
      {reviewBooking && (
        <RatingModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={fetchBookings}
        />
      )}
    </div>
  );
}