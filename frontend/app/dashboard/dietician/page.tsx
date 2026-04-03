"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

type Booking = {
  _id: string;
  date: string;
  time: string;
  mode: string;
  status: string;
  paymentStatus: string;
  dieticianAlertSeen: boolean;
  dieticianApproved: boolean;
  user: { _id: string; username: string; email: string };
};

type Profile = {
  _id: string;
  specialization: string;
  bio: string;
  experience: number;
  price: number;
  rating: number;
  reviewCount: number;
  certificateUrl: string;
  certificateStatus: string;
  isVerified: boolean;
  rejectionReason?: string;
  availableSlots: string[];
};

type NavTab = "dashboard" | "bookings" | "verify" | "notify" | "settings";

export default function DieticianDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [active, setActive] = useState<NavTab>("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const prevAlertCount = useRef(0);

  // PROFILE FORM
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [price, setPrice] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // ===================== FETCH BOOKINGS =====================
  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/dietician/my");
      const data: Booking[] = res.data || [];
      setBookings(data);

      const newAlerts = data.filter((b) => !b.dieticianAlertSeen);
      if (newAlerts.length > prevAlertCount.current) {
        toast.success("💰 New payment received!");
      }
      prevAlertCount.current = newAlerts.length;
    } catch (err) {
      console.error("Fetch bookings error:", err);
    }
  };

  // ===================== FETCH PROFILE =====================
  const fetchProfile = async () => {
    try {
      const res = await api.get("/dieticians/me");
      const p = res.data;
      setProfile(p);
      setSpecialization(p.specialization || "");
      setBio(p.bio || "");
      setExperience(String(p.experience || ""));
      setPrice(String(p.price || ""));
    } catch (err) {
      // no profile yet
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchProfile();
    const interval = setInterval(fetchBookings, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  // ===================== APPROVE BOOKING =====================
  const handleApprove = async (bookingId: string) => {
    setApprovingId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/approve`, {});
      toast.success("✅ Booking approved! Call/Chat unlocked.");
      fetchBookings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Approval failed");
    } finally {
      setApprovingId(null);
    }
  };

  // ===================== CERTIFICATE UPLOAD =====================
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("specialization", specialization);
      formData.append("bio", bio);
      formData.append("experience", experience);
      formData.append("price", price);
      if (certFile) formData.append("certificate", certFile);

      await api.post("/dieticians", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(certFile ? "Profile updated! Certificate submitted for review." : "Profile updated!");
      fetchProfile();
      setCertFile(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setUploading(false);
    }
  };

  // ===================== STATS =====================
  const total = bookings.length;
  const paid = bookings.filter((b) => b.paymentStatus === "paid").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const approved = bookings.filter((b) => b.dieticianApproved).length;
  const newAlertCount = bookings.filter((b) => !b.dieticianAlertSeen).length;

  const certStatusInfo = () => {
    if (!profile) return { label: "Not Set Up", color: "#888", icon: "⚙️" };
    switch (profile.certificateStatus) {
      case "approved": return { label: "Verified ✅", color: "#16a34a", icon: "✅" };
      case "pending": return { label: "Under Review ⏳", color: "#d97706", icon: "⏳" };
      case "rejected": return { label: "Rejected ❌", color: "#dc2626", icon: "❌" };
      default: return { label: "Not Uploaded", color: "#888", icon: "📄" };
    }
  };

  const ci = certStatusInfo();

  return (
    <div className="dd-wrapper">

      {/* SIDEBAR */}
      <nav className="dd-sidebar">
        <div className="dd-logo">
          <span>Dietara</span>
        </div>

        <ul className="dd-nav">
          {([
            { id: "dashboard", icon: "📊", label: "Dashboard" },
            { id: "bookings", icon: "📅", label: "Bookings", badge: paid },
            { id: "verify", icon: "🏅", label: "Verification" },
            { id: "notify", icon: "🔔", label: "Notifications", badge: newAlertCount },
            { id: "settings", icon: "⚙️", label: "Settings" },
          ] as { id: NavTab; icon: string; label: string; badge?: number }[]).map((item) => (
            <li
              key={item.id}
              className={active === item.id ? "dd-nav-item active" : "dd-nav-item"}
              onClick={() => setActive(item.id)}
            >
              <span className="dd-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="dd-badge">{item.badge}</span>
              )}
            </li>
          ))}
        </ul>

        <div className="dd-sidebar-footer">
          <div className="dd-user-info">
            <div className="dd-user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div>
              <p className="dd-user-name">{user?.username}</p>
              <p className="dd-user-role">Dietician</p>
            </div>
          </div>
          <button className="dd-logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="dd-main">

        {/* ======== DASHBOARD ======== */}
        {active === "dashboard" && (
          <div className="dd-section">
            <div className="dd-page-header">
              <h1>Welcome back, {user?.username} 👋</h1>
              <p>Here's your practice overview</p>
            </div>

            <div className="dd-stats-grid">
              <div className="dd-stat-card purple">
                <div className="dd-stat-icon">📅</div>
                <div>
                  <h3>{total}</h3>
                  <p>Total Bookings</p>
                </div>
              </div>
              <div className="dd-stat-card green">
                <div className="dd-stat-icon">💰</div>
                <div>
                  <h3>{paid}</h3>
                  <p>Paid</p>
                </div>
              </div>
              <div className="dd-stat-card orange">
                <div className="dd-stat-icon">⏳</div>
                <div>
                  <h3>{pending}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="dd-stat-card blue">
                <div className="dd-stat-icon">✅</div>
                <div>
                  <h3>{approved}</h3>
                  <p>Approved</p>
                </div>
              </div>
            </div>

            {/* Cert Status Banner */}
            <div className="dd-cert-banner" style={{ borderColor: ci.color }}>
              <span className="dd-cert-icon">{ci.icon}</span>
              <div>
                <p className="dd-cert-label">Verification Status</p>
                <p style={{ color: ci.color, fontWeight: 700 }}>{ci.label}</p>
                {profile?.rejectionReason && (
                  <p className="dd-cert-reason">Reason: {profile.rejectionReason}</p>
                )}
              </div>
              {profile?.certificateStatus !== "approved" && (
                <button className="dd-cert-action-btn" onClick={() => setActive("verify")}>
                  {profile?.certificateStatus === "not_uploaded" || !profile ? "Upload Certificate" : "View Status"}
                </button>
              )}
            </div>

            {/* Recent Bookings */}
            {bookings.slice(0, 3).length > 0 && (
              <div className="dd-recent">
                <h2>Recent Bookings</h2>
                {bookings.slice(0, 3).map((b) => (
                  <div key={b._id} className="dd-recent-item">
                    <div className="dd-recent-avatar">{b.user?.username?.[0]?.toUpperCase()}</div>
                    <div>
                      <p className="dd-recent-name">{b.user?.username}</p>
                      <p className="dd-recent-time">{b.date} at {b.time}</p>
                    </div>
                    <span className={`dd-status-badge ${b.status}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======== BOOKINGS ======== */}
        {active === "bookings" && (
          <div className="dd-section">
            <div className="dd-page-header">
              <h1>📅 My Bookings</h1>
              <p>{paid} paid bookings</p>
            </div>

            {bookings.length === 0 ? (
              <div className="dd-empty">
                <p>🗓️ No bookings yet. Your bookings will appear here once users pay.</p>
              </div>
            ) : (
              <div className="dd-bookings-list">
                {bookings.map((b) => (
                  <div key={b._id} className={`dd-booking-card ${!b.dieticianAlertSeen ? "new-alert" : ""}`}>
                    <div className="dd-booking-top">
                      <div className="dd-booking-avatar">{b.user?.username?.[0]?.toUpperCase()}</div>
                      <div className="dd-booking-details">
                        <h3>{b.user?.username}</h3>
                        <p>{b.user?.email}</p>
                        <p>📅 {b.date} &nbsp; ⏰ {b.time} &nbsp; 💬 {b.mode}</p>
                      </div>
                      <div className="dd-booking-badges">
                        <span className={`dd-pill ${b.paymentStatus}`}>{b.paymentStatus}</span>
                        <span className={`dd-pill ${b.status}`}>{b.status}</span>
                        {b.dieticianApproved && <span className="dd-pill approved">Approved</span>}
                        {!b.dieticianAlertSeen && <span className="dd-pill new">🔔 New</span>}
                      </div>
                    </div>

                    <div className="dd-booking-actions">
                      {/* APPROVE BUTTON — only if paid and not yet approved */}
                      {b.paymentStatus === "paid" && !b.dieticianApproved && (
                        <button
                          className="dd-approve-btn"
                          onClick={() => handleApprove(b._id)}
                          disabled={approvingId === b._id}
                        >
                          {approvingId === b._id ? "Approving..." : "✅ Approve"}
                        </button>
                      )}

                      {/* CALL / CHAT — only if approved */}
                      {b.dieticianApproved && (
                        <>
                          <button
                            className="dd-action-btn call"
                            onClick={() => router.push(`/call?bookingId=${b._id}&userId=${b.user._id}`)}
                          >
                            📞 Call
                          </button>
                          <button
                            className="dd-action-btn chat"
                            onClick={() => router.push(`/chat?bookingId=${b._id}&userId=${b.user._id}`)}
                          >
                            💬 Chat
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======== VERIFICATION ======== */}
        {active === "verify" && (
          <div className="dd-section">
            <div className="dd-page-header">
              <h1>🏅 Profile &amp; Verification</h1>
              <p>Upload your certificate for admin review</p>
            </div>

            {/* Current cert status */}
            <div className="dd-verify-status" style={{ borderColor: ci.color }}>
              <span style={{ fontSize: 32 }}>{ci.icon}</span>
              <div>
                <p className="dd-verify-status-label">Certificate Status</p>
                <p style={{ color: ci.color, fontWeight: 700, fontSize: 18 }}>{ci.label}</p>
                {profile?.rejectionReason && (
                  <p className="dd-cert-reason">Admin note: {profile.rejectionReason}</p>
                )}
                {profile?.certificateUrl && (
                  <a href={profile.certificateUrl} target="_blank" rel="noreferrer" className="dd-cert-link">
                    📄 View uploaded certificate
                  </a>
                )}
              </div>
            </div>

            {/* Profile + Cert form */}
            <form className="dd-profile-form" onSubmit={handleProfileSubmit}>
              <h2>Profile Information</h2>

              <div className="dd-form-grid">
                <div className="dd-form-field">
                  <label>Specialization *</label>
                  <input
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Weight Loss, Diabetes"
                  />
                </div>

                <div className="dd-form-field">
                  <label>Experience (years)</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="5"
                    min="0"
                  />
                </div>

                <div className="dd-form-field">
                  <label>Consultation Price (Rs.)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1500"
                    min="0"
                  />
                </div>
              </div>

              <div className="dd-form-field full">
                <label>Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell patients about your expertise..."
                  rows={3}
                />
              </div>

              <div className="dd-form-field full">
                <label>Upload Certificate (PDF / Image)</label>
                <div className="dd-upload-zone" onClick={() => document.getElementById("cert-input")?.click()}>
                  <input
                    id="cert-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                  />
                  {certFile ? (
                    <p className="dd-upload-file">📄 {certFile.name}</p>
                  ) : (
                    <>
                      <p className="dd-upload-icon">📤</p>
                      <p>Click to upload certificate</p>
                      <p className="dd-upload-hint">PDF, JPG, PNG — max 5MB</p>
                    </>
                  )}
                </div>
              </div>

              <button type="submit" className="dd-submit-btn" disabled={uploading}>
                {uploading ? "Saving..." : "Save Profile & Submit"}
              </button>
            </form>
          </div>
        )}

        {/* ======== NOTIFICATIONS ======== */}
        {active === "notify" && (
          <div className="dd-section">
            <div className="dd-page-header">
              <h1>🔔 Notifications</h1>
            </div>

            {newAlertCount === 0 ? (
              <div className="dd-empty"><p>No new notifications</p></div>
            ) : (
              <div className="dd-notify-list">
                {bookings
                  .filter((b) => !b.dieticianAlertSeen)
                  .map((b) => (
                    <div key={b._id} className="dd-notify-item">
                      <span className="dd-notify-icon">💰</span>
                      <div>
                        <p><strong>{b.user?.username}</strong> has paid for a consultation</p>
                        <p className="dd-notify-time">{b.date} at {b.time}</p>
                      </div>
                      <button
                        className="dd-approve-btn small"
                        onClick={() => { setActive("bookings"); }}
                      >
                        View
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======== SETTINGS ======== */}
        {active === "settings" && (
          <div className="dd-section">
            <div className="dd-page-header">
              <h1>⚙️ Settings</h1>
            </div>
            <div className="dd-settings-card">
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> Dietician</p>
              <button className="dd-submit-btn" style={{ marginTop: 20 }} onClick={() => setActive("verify")}>
                Update Profile
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}