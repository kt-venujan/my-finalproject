"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { resolveBackendAssetUrl } from "@/lib/assetUrl";
import {
  FiAward,
  FiBarChart2,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiHome,
  FiMessageCircle,
  FiPhone,
  FiSearch,
  FiSettings,
  FiLock,
  FiTrash2,
  FiUpload,
  FiXCircle,
} from "react-icons/fi";

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
type SettingsPanel = "account" | "security" | "delete";

export default function DieticianDashboard() {
  const { user, logout, setAuthUser } = useAuth();
  const router = useRouter();

  const [active, setActive] = useState<NavTab>("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const prevAlertCount = useRef(0);
  const accessIssueHandled = useRef(false);

  const normalizeRole = (role?: string) => {
    const value = String(role || "").trim().toLowerCase();
    if (value === "dietitian") return "dietician";
    if (value === "customer") return "user";
    return value;
  };

  // PROFILE FORM
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [price, setPrice] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [accountAvatarFile, setAccountAvatarFile] = useState<File | null>(null);
  const [accountAvatarPreview, setAccountAvatarPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>("account");
  const [deleteOtpSending, setDeleteOtpSending] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState("");

  const resolveAvatar = (avatar?: string) => {
    return resolveBackendAssetUrl(avatar);
  };

  // ===================== FETCH BOOKINGS =====================
  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/dietician/my");
      const data: Booking[] = res.data || [];
      setBookings(data);

      const newAlerts = data.filter((b) => !b.dieticianAlertSeen);
      if (newAlerts.length > prevAlertCount.current) {
        toast.success("New payment received!");
      }
      prevAlertCount.current = newAlerts.length;
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        setBookings([]);

        if (!accessIssueHandled.current) {
          accessIssueHandled.current = true;
          if (status === 401) {
            toast.info("Session expired. Please login again.");
            logout();
            return;
          }

          toast.error("Dietician access required for this dashboard.");
          router.replace("/");
        }

        return;
      }

      console.warn("Fetch bookings failed:", err?.response?.data?.message || err?.message || err);
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
    if (!user) return;

    if (normalizeRole(user.role) !== "dietician") {
      if (!accessIssueHandled.current) {
        accessIssueHandled.current = true;
        toast.error("Dietician access required for this dashboard.");
      }
      router.replace("/");
      return;
    }

    accessIssueHandled.current = false;
    fetchBookings();
    fetchProfile();

    const interval = setInterval(fetchBookings, 6000);
    return () => clearInterval(interval);
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    setAccountName(user.username || "");
    setAccountEmail(user.email || "");
    setAccountPhone(user.phone || "");
    setAccountAvatarPreview(resolveAvatar(user.avatar));
  }, [user]);

  // ===================== APPROVE BOOKING =====================
  const handleApprove = async (bookingId: string) => {
    setApprovingId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/approve`, {});
      toast.success("Booking approved! Call/Chat unlocked.");
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
  const normalizedSearch = search.trim().toLowerCase();

  const filteredBookings = normalizedSearch
    ? bookings.filter((b) =>
        [
          b.user?.username,
          b.user?.email,
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

  const filteredNotifications = normalizedSearch
    ? bookings.filter(
        (b) =>
          !b.dieticianAlertSeen &&
          [b.user?.username, b.date, b.time, b.mode]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
      )
    : bookings.filter((b) => !b.dieticianAlertSeen);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedSearch) return;

    if (filteredBookings.length > 0) {
      setActive("bookings");
      return;
    }

    if (filteredNotifications.length > 0) {
      setActive("notify");
      return;
    }

    if (
      [
        specialization,
        bio,
        String(profile?.experience || ""),
        String(profile?.price || ""),
        accountName,
        accountEmail,
        accountPhone,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    ) {
      setActive("settings");
      return;
    }

    toast.info("No matches found for your search.");
  };

  const certStatusInfo = () => {
    if (!profile) return { label: "Not Set Up", color: "#888", icon: <FiSettings /> };
    switch (profile.certificateStatus) {
      case "approved": return { label: "Verified", color: "#16a34a", icon: <FiCheckCircle /> };
      case "pending": return { label: "Under Review", color: "#d97706", icon: <FiClock /> };
      case "rejected": return { label: "Rejected", color: "#dc2626", icon: <FiXCircle /> };
      default: return { label: "Not Uploaded", color: "#888", icon: <FiFileText /> };
    }
  };

  const ci = certStatusInfo();

  const handleAvatarChange = (file: File | null) => {
    setAccountAvatarFile(file);

    if (file) {
      setAccountAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
      return;
    }

    setAccountAvatarPreview(resolveAvatar(user?.avatar));
  };

  const handleRemoveAvatarClick = () => {
    if (!removeAvatar) {
      const confirmed = window.confirm(
        "Remove current avatar? This will apply after you click Save Account."
      );

      if (!confirmed) return;

      setRemoveAvatar(true);
      setAccountAvatarFile(null);
      setAccountAvatarPreview("");
      return;
    }

    setRemoveAvatar(false);
    setAccountAvatarPreview(resolveAvatar(user?.avatar));
  };

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      const formData = new FormData();
      formData.append("username", accountName);
      formData.append("phone", accountPhone);

      if (accountAvatarFile) {
        formData.append("avatar", accountAvatarFile);
      }
      if (removeAvatar) {
        formData.append("removeAvatar", "true");
      }

      const res = await api.put("/auth/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAuthUser(res.data?.user || null);
      setAccountAvatarFile(null);
      setRemoveAvatar(false);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSendOtp = async () => {
    if (!accountEmail) {
      toast.error("Email is required");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: accountEmail });
      toast.success(res.data?.message || "OTP sent");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountEmail || !resetOtp || !resetNewPassword) {
      toast.error("Email, OTP and new password are required");
      return;
    }

    setResettingPassword(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email: accountEmail,
        otp: resetOtp,
        newPassword: resetNewPassword,
      });
      toast.success(res.data?.message || "Password reset successful");
      setResetOtp("");
      setResetNewPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleSendDeleteOtp = async () => {
    setDeleteOtpSending(true);
    try {
      const res = await api.post("/auth/delete-account/send-otp");
      toast.success(res.data?.message || "Delete OTP sent");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send delete OTP");
    } finally {
      setDeleteOtpSending(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deleteOtp.trim()) {
      toast.error("Enter OTP to delete profile");
      return;
    }

    setDeletingAccount(true);
    try {
      const res = await api.delete("/auth/delete-account", {
        data: { otp: deleteOtp.trim() },
      });

      toast.success(res.data?.message || "Account deleted successfully");
      logout();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete profile");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="dd-wrapper">

      {/* SIDEBAR */}
      <nav className="dd-sidebar">
        <div className="dd-logo">
          <span>Dietara</span>
        </div>

        <ul className="dd-nav">
          {([
            { id: "settings", icon: <FiSettings />, label: "My Profile" },
            { id: "dashboard", icon: <FiBarChart2 />, label: "Dashboard" },
            { id: "bookings", icon: <FiCalendar />, label: "Bookings", badge: paid },
            { id: "verify", icon: <FiAward />, label: "Verification" },
            { id: "notify", icon: <FiBell />, label: "Notifications", badge: newAlertCount },
          ] as { id: NavTab; icon: JSX.Element; label: string; badge?: number }[]).map((item) => (
            <li
              key={item.id}
              className={active === item.id ? "dd-nav-item active" : "dd-nav-item"}
              onClick={() => {
                setActive(item.id);
                if (item.id === "settings") {
                  setSettingsPanel("account");
                }
              }}
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
            {accountAvatarPreview ? (
              <img
                src={accountAvatarPreview}
                alt={user?.username || "Dietician"}
                className="dd-user-avatar-img"
                onError={() => setAccountAvatarPreview("")}
              />
            ) : (
              <div className="dd-user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            )}
            <div>
              <p className="dd-user-name">{user?.username}</p>
              <p className="dd-user-role">Dietician</p>
            </div>
          </div>
          <button className="dd-logout-btn" onClick={logout}>Logout</button>
          <div className="dd-mini-links">
            <a href="#">Help</a>
            <a href="#">Terms</a>
          </div>
          <p className="dd-mini-copy">Copyright 2026</p>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="dd-main">
        <div className="dd-topbar">
          <form className="dd-topbar-search" onSubmit={handleSearchSubmit}>
            <FiSearch className="dd-topbar-search-icon" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings, notifications, profile info"
            />
          </form>

          <div className="dd-topbar-right">
            <button
              className="dd-topbar-notify dd-topbar-home"
              onClick={() => router.push("/")}
              aria-label="Back to home"
              title="Back to home"
            >
              <FiHome />
            </button>
            <button
              className="dd-topbar-notify"
              onClick={() => setActive("notify")}
              aria-label="Open notifications"
            >
              <FiBell />
              {newAlertCount > 0 && <span className="dd-topbar-badge">{newAlertCount}</span>}
            </button>
            {accountAvatarPreview ? (
              <img
                src={accountAvatarPreview}
                alt={user?.username || "Dietician"}
                className="dd-topbar-avatar-img"
                onError={() => setAccountAvatarPreview("")}
              />
            ) : (
              <div className="dd-topbar-avatar" title={user?.username || "Dietician"}>
                {user?.username?.[0]?.toUpperCase() || "D"}
              </div>
            )}
          </div>
        </div>

        {/* ======== DASHBOARD ======== */}
        {active === "dashboard" && (
          <div className="dd-section">
            <div className="dd-page-header">
              <h1>Welcome back, {user?.username}</h1>
              <p>Here's your practice overview</p>
            </div>

            <div className="dd-stats-grid">
              <div className="dd-stat-card purple">
                <div className="dd-stat-icon"><FiCalendar /></div>
                <div>
                  <h3>{total}</h3>
                  <p>Total Bookings</p>
                </div>
              </div>
              <div className="dd-stat-card green">
                <div className="dd-stat-icon"><FiDollarSign /></div>
                <div>
                  <h3>{paid}</h3>
                  <p>Paid</p>
                </div>
              </div>
              <div className="dd-stat-card orange">
                <div className="dd-stat-icon"><FiClock /></div>
                <div>
                  <h3>{pending}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="dd-stat-card blue">
                <div className="dd-stat-icon"><FiCheckCircle /></div>
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
            {filteredBookings.slice(0, 3).length > 0 && (
              <div className="dd-recent">
                <h2>Recent Bookings</h2>
                {filteredBookings.slice(0, 3).map((b) => (
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
              <h1 className="dd-title">
                <FiCalendar className="dd-title-icon" />
                My Bookings
              </h1>
              <p>{paid} paid bookings</p>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="dd-empty">
                <p>No bookings yet. Your bookings will appear here once users pay.</p>
              </div>
            ) : (
              <div className="dd-bookings-list">
                {filteredBookings.map((b) => (
                  <div key={b._id} className={`dd-booking-card ${!b.dieticianAlertSeen ? "new-alert" : ""}`}>
                    <div className="dd-booking-top">
                      <div className="dd-booking-avatar">{b.user?.username?.[0]?.toUpperCase()}</div>
                      <div className="dd-booking-details">
                        <h3>{b.user?.username}</h3>
                        <p>{b.user?.email}</p>
                        <p>
                          <span className="dd-inline-icon"><FiCalendar /></span>
                          {b.date}
                          <span className="dd-inline-icon"><FiClock /></span>
                          {b.time}
                          <span className="dd-inline-icon"><FiMessageCircle /></span>
                          {b.mode}
                        </p>
                      </div>
                      <div className="dd-booking-badges">
                        <span className={`dd-pill ${b.paymentStatus}`}>{b.paymentStatus}</span>
                        <span className={`dd-pill ${b.status}`}>{b.status}</span>
                        {b.dieticianApproved && <span className="dd-pill approved">Approved</span>}
                        {!b.dieticianAlertSeen && (
                          <span className="dd-pill new">
                            <FiBell className="dd-pill-icon" />
                            New
                          </span>
                        )}
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
                          {approvingId === b._id ? "Approving..." : (
                            <>
                              <FiCheckCircle className="dd-action-icon" />
                              Approve
                            </>
                          )}
                        </button>
                      )}

                      {/* CALL / CHAT — only if approved */}
                      {b.dieticianApproved && (
                        <>
                          <button
                            className="dd-action-btn call"
                            onClick={() => router.push(`/call/${b._id}`)}
                          >
                            <FiPhone className="dd-action-icon" />
                            Call
                          </button>
                          <button
                            className="dd-action-btn chat"
                            onClick={() => router.push(`/chat/${b._id}`)}
                          >
                            <FiMessageCircle className="dd-action-icon" />
                            Chat
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
              <h1 className="dd-title">
                <FiAward className="dd-title-icon" />
                Profile &amp; Verification
              </h1>
              <p>Upload your certificate for admin review</p>
            </div>

            {/* Current cert status */}
            <div className="dd-verify-status" style={{ borderColor: ci.color }}>
              <span className="dd-verify-icon">{ci.icon}</span>
              <div>
                <p className="dd-verify-status-label">Certificate Status</p>
                <p style={{ color: ci.color, fontWeight: 700, fontSize: 18 }}>{ci.label}</p>
                {profile?.rejectionReason && (
                  <p className="dd-cert-reason">Admin note: {profile.rejectionReason}</p>
                )}
                {profile?.certificateUrl && (
                  <a href={profile.certificateUrl} target="_blank" rel="noreferrer" className="dd-cert-link">
                    <FiFileText className="dd-link-icon" />
                    View uploaded certificate
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
                    <p className="dd-upload-file">
                      <FiFileText className="dd-upload-file-icon" />
                      {certFile.name}
                    </p>
                  ) : (
                    <>
                      <p className="dd-upload-icon"><FiUpload /></p>
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
              <h1 className="dd-title">
                <FiBell className="dd-title-icon" />
                Notifications
              </h1>
            </div>

            {filteredNotifications.length === 0 ? (
              <div className="dd-empty"><p>No new notifications</p></div>
            ) : (
              <div className="dd-notify-list">
                {filteredNotifications.map((b) => (
                    <div key={b._id} className="dd-notify-item">
                      <span className="dd-notify-icon"><FiDollarSign /></span>
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
              <h1 className="dd-title">
                <FiSettings className="dd-title-icon" />
                Settings
              </h1>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSettingsPanel("account")}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  settingsPanel === "account"
                    ? "border-[#8b0c2e] bg-[#8b0c2e] text-white"
                    : "border-[#f0d3dd] bg-white text-[#8b0c2e] hover:bg-[#fff3f7]"
                }`}
              >
                Account Profile
              </button>
              <button
                type="button"
                onClick={() => setSettingsPanel("security")}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  settingsPanel === "security"
                    ? "border-[#8b0c2e] bg-[#8b0c2e] text-white"
                    : "border-[#f0d3dd] bg-white text-[#8b0c2e] hover:bg-[#fff3f7]"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <FiLock />
                  Security
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSettingsPanel("delete")}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  settingsPanel === "delete"
                    ? "border-[#b91c1c] bg-[#b91c1c] text-white"
                    : "border-[#f4c9d0] bg-[#fff5f6] text-[#b91c1c] hover:bg-[#ffecef]"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <FiTrash2 />
                  Delete Profile
                </span>
              </button>
            </div>

            <div className="dd-settings-grid" style={{ gridTemplateColumns: "1fr" }}>
              {settingsPanel === "account" && (
                <form className="dd-settings-card" onSubmit={handleAccountSave}>
                  <h3>Account Profile</h3>
                  <div className="dd-account-avatar-row">
                    {accountAvatarPreview ? (
                      <img
                        src={accountAvatarPreview}
                        alt={accountName || "Dietician"}
                        className="dd-account-avatar"
                        onError={() => setAccountAvatarPreview("")}
                      />
                    ) : (
                      <div className="dd-account-avatar placeholder">
                        {accountName?.[0]?.toUpperCase() || "D"}
                      </div>
                    )}
                    <div className="dd-account-avatar-controls">
                      <label className="profile-file-picker" aria-label="Choose avatar">
                        <span className="profile-file-picker-btn">Choose avatar</span>
                        <span className="profile-file-picker-name">
                          {accountAvatarFile?.name || "No file chosen"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
                        />
                      </label>
                      <button
                        type="button"
                        className={`profile-remove-btn ${removeAvatar ? "active" : ""}`}
                        onClick={handleRemoveAvatarClick}
                      >
                        {removeAvatar ? "Undo remove avatar" : "Remove current avatar"}
                      </button>
                      {removeAvatar && (
                        <p className="dd-settings-help">Avatar will be removed when you save account.</p>
                      )}
                    </div>
                  </div>

                  <input
                    className="dd-settings-input"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Username"
                    required
                  />
                  <input
                    className="dd-settings-input"
                    type="email"
                    value={accountEmail}
                    placeholder="Email"
                    readOnly
                    disabled
                  />
                  <p className="dd-settings-help">Email is locked and cannot be changed.</p>
                  <input
                    className="dd-settings-input"
                    value={accountPhone}
                    onChange={(e) => setAccountPhone(e.target.value)}
                    placeholder="Phone"
                  />

                  <button className="dd-submit-btn" type="submit" disabled={savingAccount}>
                    {savingAccount ? "Saving..." : "Save Account"}
                  </button>
                </form>
              )}

              {settingsPanel === "security" && (
                <form className="dd-settings-card" onSubmit={handleResetPassword}>
                  <h3>Reset Password (OTP)</h3>
                  <p className="dd-settings-help">
                    Send OTP to your email and verify it to set a new password.
                  </p>

                  <button
                    type="button"
                    className="dd-settings-otp-btn"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                  >
                    {sendingOtp ? "Sending OTP..." : "Send OTP"}
                  </button>

                  <input
                    className="dd-settings-input"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="OTP code"
                    required
                  />
                  <input
                    className="dd-settings-input"
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="New password"
                    minLength={6}
                    required
                  />

                  <button className="dd-submit-btn" type="submit" disabled={resettingPassword}>
                    {resettingPassword ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}

              {settingsPanel === "delete" && (
                <form className="dd-settings-card" onSubmit={handleDeleteAccount}>
                  <h3 className="text-[#b91c1c]">Delete Profile</h3>
                  <p className="dd-settings-help">
                    This action permanently deletes your account and cannot be undone.
                  </p>

                  <button
                    type="button"
                    className="dd-settings-otp-btn"
                    onClick={handleSendDeleteOtp}
                    disabled={deleteOtpSending}
                  >
                    {deleteOtpSending ? "Sending OTP..." : "Send Delete OTP"}
                  </button>

                  <input
                    className="dd-settings-input"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    placeholder="Enter delete OTP"
                    required
                  />

                  <button
                    className="dd-submit-btn"
                    type="submit"
                    disabled={deletingAccount}
                    style={{ background: "#b91c1c" }}
                  >
                    {deletingAccount ? "Deleting..." : "Delete Profile"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}