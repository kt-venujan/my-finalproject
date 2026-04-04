"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { resolveBackendAssetUrl } from "@/lib/assetUrl";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCoffee,
  FiCpu,
  FiDroplet,
  FiFeather,
  FiHeart,
  FiHome,
  FiArrowLeft,
  FiCreditCard,
  FiMessageCircle,
  FiMoon,
  FiPhone,
  FiPackage,
  FiSearch,
  FiStar,
  FiUser,
  FiUserCheck,
} from "react-icons/fi";

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

type KitchenOrder = {
  _id: string;
  items: Array<{
    name: string;
    quantity: number;
    bundleOfferName?: string;
    bundlePlanType?: "weekly" | "monthly";
  }>;
  subtotal: number;
  status:
    | "pending"
    | "paid"
    | "processing"
    | "cooking"
    | "packed"
    | "ready_to_deliver"
    | "preparing"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: "cash_on_delivery" | "card";
  createdAt: string;
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
  const { user, logout, setAuthUser } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [active, setActive] = useState<"dashboard" | "bookings" | "kitchen" | "tips" | "cards" | "profile">("dashboard");
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAvatarFile, setProfileAvatarFile] = useState<File | null>(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpResetting, setOtpResetting] = useState(false);
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");

  const resolveAvatar = (avatar?: string) => {
    return resolveBackendAssetUrl(avatar);
  };

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
    fetchKitchenOrders();
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfileName(user.username || "");
    setProfileEmail(user.email || "");
    setProfilePhone(user.phone || "");
    setProfileAvatarPreview(resolveAvatar(user.avatar));
  }, [user]);

  useEffect(() => {
    if (active === "cards") {
      fetchSavedCards();
    }
    if (active === "kitchen") {
      fetchKitchenOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const fetchKitchenOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await api.get("/payments/orders/my");
      setKitchenOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchSavedCards = async () => {
    try {
      setCardsLoading(true);
      const res = await api.get("/payments/payment-methods");
      setSavedCards(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCardsLoading(false);
    }
  };

  const deleteCard = async (id: string) => {
    try {
      await api.delete(`/payments/payment-methods/${id}`);
      setSavedCards((prev) => prev.filter((card) => card._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const approved = bookings.filter((b) => b.dieticianApproved).length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const kitchenPending = kitchenOrders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  ).length;

  const tips = [
    { icon: <FiDroplet />, tip: "Drink at least 2L of water daily" },
    { icon: <FiActivity />, tip: "Fill half your plate with vegetables" },
    { icon: <FiBarChart2 />, tip: "Walk 30 minutes every day" },
    { icon: <FiMoon />, tip: "Get 7-8 hours of quality sleep" },
    { icon: <FiFeather />, tip: "Eat whole fruits instead of juice" },
    { icon: <FiHeart />, tip: "Manage stress with meditation" },
  ];

  const normalizedSearch = search.trim().toLowerCase();

  const filteredBookings = normalizedSearch
    ? bookings.filter((b) =>
        [
          b.dietician?.username,
          b.date,
          b.time,
          b.mode,
          b.status,
          b.paymentStatus,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      )
    : bookings;

  const filteredKitchenOrders = normalizedSearch
    ? kitchenOrders.filter((o) =>
        [
          o.status,
          o.paymentStatus,
          o.paymentMethod,
          ...o.items.map((i) => `${i.name} ${i.quantity}`),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      )
    : kitchenOrders;

  const filteredCards = normalizedSearch
    ? savedCards.filter((card) =>
        [card.brand, card.last4, card.expMonth, card.expYear]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      )
    : savedCards;

  const filteredTips = normalizedSearch
    ? tips.filter((t) => t.tip.toLowerCase().includes(normalizedSearch))
    : tips;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedSearch) return;

    if (filteredBookings.length > 0) {
      setActive("bookings");
      return;
    }

    if (filteredKitchenOrders.length > 0) {
      setActive("kitchen");
      return;
    }

    if (filteredCards.length > 0) {
      setActive("cards");
      return;
    }

    if (filteredTips.length > 0) {
      setActive("tips");
      return;
    }

    if (
      [profileName, profileEmail, profilePhone]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    ) {
      setActive("profile");
      return;
    }

    toast.info("No matches found for your search.");
  };

  const handleProfileImageChange = (file: File | null) => {
    setProfileAvatarFile(file);
    if (file) {
      setProfileAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
      return;
    }
    setProfileAvatarPreview(resolveAvatar(user?.avatar));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append("username", profileName);
      formData.append("email", profileEmail);
      formData.append("phone", profilePhone);

      if (profileAvatarFile) {
        formData.append("avatar", profileAvatarFile);
      }
      if (removeAvatar) {
        formData.append("removeAvatar", "true");
      }

      const res = await api.put("/auth/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAuthUser(res.data?.user || null);
      setProfileAvatarFile(null);
      setRemoveAvatar(false);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const sendResetOtp = async () => {
    if (!profileEmail) {
      toast.error("Email is required to receive OTP");
      return;
    }

    setOtpSending(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: profileEmail });
      toast.success(res.data?.message || "OTP sent to your email");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const submitPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileEmail || !resetOtp || !resetNewPassword) {
      toast.error("Email, OTP and new password are required");
      return;
    }

    setOtpResetting(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email: profileEmail,
        otp: resetOtp,
        newPassword: resetNewPassword,
      });
      toast.success(res.data?.message || "Password reset successful");
      setResetOtp("");
      setResetNewPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setOtpResetting(false);
    }
  };

  return (
    <div className="ud-wrapper">

      {/* SIDEBAR */}
      <nav className="ud-sidebar">
        <Link href="/" className="ud-home-link" aria-label="Back to home">
          <FiArrowLeft className="ud-home-icon" />
        </Link>
        <div className="ud-logo">Dietara</div>
        <ul className="ud-nav">
          {([
            { id: "profile", icon: <FiUser className="ud-nav-icon" />, label: "My Profile" },
            { id: "dashboard", icon: <FiHome className="ud-nav-icon" />, label: "Dashboard" },
            { id: "bookings", icon: <FiCalendar className="ud-nav-icon" />, label: "My Bookings", badge: pending },
            { id: "kitchen", icon: <FiPackage className="ud-nav-icon" />, label: "Kitchen Orders", badge: kitchenPending },
            { id: "tips", icon: <FiHeart className="ud-nav-icon" />, label: "Health Tips" },
            { id: "cards", icon: <FiCreditCard className="ud-nav-icon" />, label: "Payment Methods" },
          ] as const).map((item) => (
            <li
              key={item.id}
              className={active === item.id ? "ud-nav-item active" : "ud-nav-item"}
              onClick={() => setActive(item.id)}
            >
              <span className="ud-nav-icon-wrap">{item.icon}</span>
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
          <div className="ud-mini-links">
            <a href="#">Help</a>
            <a href="#">Terms</a>
          </div>
          <p className="ud-mini-copy">Copyright 2026</p>
        </div>
      </nav>

      {/* MAIN */}
      <main className="ud-main">
        <div className="ud-topbar">
          <form className="ud-topbar-search" onSubmit={handleSearchSubmit}>
            <FiSearch className="ud-topbar-search-icon" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings, kitchen orders, tips"
            />
          </form>

          <div className="ud-topbar-right">
            <button
              className="ud-topbar-notify"
              onClick={() => setActive("bookings")}
              aria-label="Open notifications"
            >
              <FiBell />
              {pending + kitchenPending > 0 && (
                <span className="ud-topbar-badge">{pending + kitchenPending}</span>
              )}
            </button>
            {profileAvatarPreview ? (
              <img
                src={profileAvatarPreview}
                alt={user?.username || "User"}
                className="ud-topbar-avatar-img"
                onError={() => setProfileAvatarPreview("")}
              />
            ) : (
              <div className="ud-topbar-avatar" title={user?.username || "User"}>
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        </div>

        {/* DASHBOARD */}
        {active === "dashboard" && (
          <div className="ud-section">
            <div className="ud-page-header">
              <h1>Welcome, {user?.username}</h1>
              <p>Track your health journey</p>
            </div>

            <div className="ud-stats">
              <div className="ud-stat blue">
                <div className="ud-stat-icon"><FiCalendar /></div>
                <h3>{bookings.length}</h3>
                <p>Bookings</p>
              </div>
              <div className="ud-stat green">
                <div className="ud-stat-icon"><FiCheckCircle /></div>
                <h3>{approved}</h3>
                <p>Approved</p>
              </div>
              <div className="ud-stat orange">
                <div className="ud-stat-icon"><FiClock /></div>
                <h3>{pending}</h3>
                <p>Pending</p>
              </div>
              <div className="ud-stat purple">
                <div className="ud-stat-icon"><FiPackage /></div>
                <h3>{kitchenOrders.length}</h3>
                <p>Kitchen Orders</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="ud-quick">
              <h2>Quick Actions</h2>
              <div className="ud-quick-grid">
                <button className="ud-quick-btn" onClick={() => router.push("/dietician")}>
                  <span className="ud-quick-icon"><FiUserCheck /></span>
                  <span>Book Dietician</span>
                </button>
                <button className="ud-quick-btn" onClick={() => router.push("/tracking")}>
                  <span className="ud-quick-icon"><FiBarChart2 /></span>
                  <span>Track Weight</span>
                </button>
                <button className="ud-quick-btn" onClick={() => router.push("/ai-assistant")}>
                  <span className="ud-quick-icon"><FiCpu /></span>
                  <span>AI Assistant</span>
                </button>
                <button className="ud-quick-btn" onClick={() => router.push("/kitchen")}>
                  <span className="ud-quick-icon"><FiCoffee /></span>
                  <span>Kitchen Menu</span>
                </button>
                <button className="ud-quick-btn" onClick={() => setActive("kitchen")}>
                  <span className="ud-quick-icon"><FiPackage /></span>
                  <span>My Orders</span>
                </button>
              </div>
            </div>

            {/* Upcoming Bookings (snapshot) */}
            {filteredBookings.slice(0, 2).length > 0 && (
              <div className="ud-upcoming">
                <h2>Upcoming Consultations</h2>
                {filteredBookings.slice(0, 2).map((b) => (
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

            {filteredKitchenOrders.slice(0, 2).length > 0 && (
              <div className="ud-upcoming">
                <h2>Recent Kitchen Orders</h2>
                {filteredKitchenOrders.slice(0, 2).map((order) => (
                  <div key={order._id} className="ud-booking-mini">
                    <div>
                      <p>
                        <strong>Rs. {Number(order.subtotal || 0).toLocaleString()}</strong>
                      </p>
                      <p>
                        {order.items.slice(0, 2).map((i) => i.name).join(", ")}
                        {order.items.length > 2 ? " ..." : ""}
                      </p>
                    </div>
                    <span className={`ud-pill ${order.status}`}>{order.status}</span>
                  </div>
                ))}
                <button className="ud-view-all-link" onClick={() => setActive("kitchen")}>
                  View all kitchen orders →
                </button>
              </div>
            )}
          </div>
        )}

        {/* PAYMENT METHODS */}
        {active === "cards" && (
          <div className="ud-section">
            <div className="ud-page-header">
              <h1>Payment Methods</h1>
              <p>Manage your saved cards</p>
            </div>

            {cardsLoading ? (
              <div className="ud-empty">Loading saved cards...</div>
            ) : filteredCards.length === 0 ? (
              <div className="ud-empty">No saved cards yet.</div>
            ) : (
              <div className="ud-cards-grid">
                {filteredCards.map((card) => (
                  <div key={card._id} className="ud-card-item">
                    <div className="ud-card-meta">
                      <span className="ud-card-brand">{card.brand || "Card"}</span>
                      <span className="ud-card-last4">•••• {card.last4}</span>
                    </div>
                    <p className="ud-card-exp">Expires {card.expMonth}/{card.expYear}</p>
                    <button className="ud-card-delete" onClick={() => deleteCard(card._id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS */}
        {active === "bookings" && (
          <div className="ud-section">
            <div className="ud-page-header">
              <h1>My Bookings</h1>
              <button className="ud-new-booking-btn" onClick={() => router.push("/dietician")}>
                + New Booking
              </button>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="ud-empty">
                <p>No bookings yet.</p>
                <button onClick={() => router.push("/dietician")}>Book a Dietician</button>
              </div>
            ) : (
              <div className="ud-bookings-list">
                {filteredBookings.map((b) => (
                  <div key={b._id} className={`ud-booking-card ${b.dieticianApproved ? "approved" : ""}`}>
                    <div className="ud-booking-top">
                      <div className="ud-booking-avatar">{b.dietician?.username?.[0]?.toUpperCase()}</div>
                      <div className="ud-booking-info">
                        <h3>{b.dietician?.username}</h3>
                        <p>
                          <span className="ud-inline-icon first"><FiCalendar /></span>
                          {b.date}
                          <span className="ud-inline-icon"><FiClock /></span>
                          {b.time}
                          <span className="ud-inline-icon"><FiMessageCircle /></span>
                          {b.mode}
                        </p>
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
                            <FiPhone className="ud-action-icon" />
                            Call
                          </button>
                          <button
                            className="ud-action-btn chat"
                            onClick={() => router.push(`/chat?bookingId=${b._id}`)}
                          >
                            <FiMessageCircle className="ud-action-icon" />
                            Chat
                          </button>
                          {!b.reviewSubmitted && (
                            <button
                              className="ud-action-btn review"
                              onClick={() => setReviewBooking(b)}
                            >
                              <FiStar className="ud-action-icon" />
                              Rate
                            </button>
                          )}
                          {b.reviewSubmitted && (
                            <span className="ud-action-btn rated">
                              <FiCheckCircle className="ud-action-icon" />
                              Rated
                            </span>
                          )}
                        </>
                      ) : (
                        <p className="ud-waiting">
                          {b.paymentStatus === "paid"
                            ? "Waiting for dietician approval..."
                            : "Payment required"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KITCHEN ORDERS */}
        {active === "kitchen" && (
          <div className="ud-section">
            <div className="ud-page-header">
              <h1>Kitchen Orders</h1>
              <button className="ud-new-booking-btn" onClick={() => router.push("/kitchen")}>
                + New Kitchen Order
              </button>
            </div>

            {ordersLoading ? (
              <div className="ud-empty">Loading kitchen orders...</div>
            ) : filteredKitchenOrders.length === 0 ? (
              <div className="ud-empty">
                <p>No kitchen orders yet.</p>
                <button onClick={() => router.push("/kitchen")}>Order from Kitchen</button>
              </div>
            ) : (
              <div className="ud-bookings-list">
                {filteredKitchenOrders.map((order) => {
                  const bundlePlan = order.items.find((item) => item.bundlePlanType)?.bundlePlanType;
                  const hasBundle =
                    Boolean(bundlePlan) || order.items.some((item) => Boolean(item.bundleOfferName));

                  return (
                    <div key={order._id} className="ud-kitchen-card">
                    <div className="ud-booking-top">
                      <div className="ud-booking-avatar"><FiPackage /></div>
                      <div className="ud-booking-info">
                        <h3>Rs. {Number(order.subtotal || 0).toLocaleString()}</h3>
                        <p>
                          {new Date(order.createdAt).toLocaleDateString()} · {order.paymentMethod === "card" ? "Card" : "Cash on delivery"}
                        </p>
                        <p>
                          {order.items
                            .map((item) => `${item.name} x${item.quantity}`)
                            .join(", ")}
                        </p>
                        {hasBundle && (
                          <p className="ud-waiting">
                            Estimated delivery ({bundlePlan || "bundle"}): 1-5 working days
                          </p>
                        )}
                      </div>
                      <div className="ud-booking-pills">
                        <span className={`ud-pill ${order.paymentStatus}`}>
                          {order.paymentStatus}
                        </span>
                        <span className={`ud-pill ${order.status}`}>{order.status}</span>
                      </div>
                    </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* HEALTH TIPS */}
        {active === "tips" && (
          <div className="ud-section">
            <div className="ud-page-header">
              <h1>Health Tips</h1>
            </div>
            <div className="ud-tips-grid">
              {filteredTips.map((t, i) => (
                <div key={i} className="ud-tip-card">
                  <span className="ud-tip-icon">{t.icon}</span>
                  <p>{t.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === "profile" && (
          <div className="ud-section">
            <div className="ud-page-header">
              <h1>My Profile</h1>
              <p>Edit your details and profile image</p>
            </div>

            <div className="ud-profile-grid">
              <form className="ud-profile-card" onSubmit={saveProfile}>
                <h3>Account Details</h3>

                <div className="ud-avatar-editor">
                  {profileAvatarPreview ? (
                    <img
                      src={profileAvatarPreview}
                      alt={profileName || "User"}
                      className="ud-profile-avatar"
                      onError={() => setProfileAvatarPreview("")}
                    />
                  ) : (
                    <div className="ud-profile-avatar placeholder">
                      {profileName?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}

                  <div className="ud-avatar-controls">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProfileImageChange(e.target.files?.[0] || null)}
                    />
                    <label className="ud-check-row">
                      <input
                        type="checkbox"
                        checked={removeAvatar}
                        onChange={(e) => setRemoveAvatar(e.target.checked)}
                      />
                      Remove current avatar
                    </label>
                  </div>
                </div>

                <input
                  className="ud-input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Username"
                  required
                />
                <input
                  className="ud-input"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
                <input
                  className="ud-input"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="Phone"
                />

                <button className="ud-new-booking-btn" type="submit" disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </form>

              <form className="ud-profile-card" onSubmit={submitPasswordReset}>
                <h3>Reset Password (OTP)</h3>
                <p className="ud-profile-help">
                  We will send an OTP to your registered email before resetting your password.
                </p>

                <button
                  type="button"
                  className="ud-ghost-btn"
                  onClick={sendResetOtp}
                  disabled={otpSending}
                >
                  {otpSending ? "Sending OTP..." : "Send OTP"}
                </button>

                <input
                  className="ud-input"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  placeholder="Enter OTP"
                  required
                />
                <input
                  className="ud-input"
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={6}
                  required
                />

                <button className="ud-new-booking-btn" type="submit" disabled={otpResetting}>
                  {otpResetting ? "Resetting..." : "Reset Password"}
                </button>
              </form>
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