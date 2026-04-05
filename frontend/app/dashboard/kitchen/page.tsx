"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiLogOut,
  FiPackage,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { resolveBackendAssetUrl } from "@/lib/assetUrl";

type KitchenOrderStatus =
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

type KitchenOrder = {
  _id: string;
  user?: { username?: string; email?: string };
  items: Array<{ name: string; quantity: number; bundleOfferName?: string }>;
  subtotal: number;
  status: KitchenOrderStatus;
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: "cash_on_delivery" | "card";
  createdAt: string;
};

type Tab = "profile" | "dashboard" | "orders";
type ProfilePanel = "account" | "security" | "delete";

const statusOptions: KitchenOrderStatus[] = [
  "pending",
  "processing",
  "cooking",
  "packed",
  "ready_to_deliver",
  "delivered",
  "cancelled",
  "paid",
  "preparing",
  "out_for_delivery",
];

const statusLabel: Record<KitchenOrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  cooking: "Cooking",
  packed: "Packed",
  ready_to_deliver: "Ready To Deliver",
  preparing: "Preparing",
  out_for_delivery: "Out For Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function KitchenDashboardPage() {
  const router = useRouter();
  const { user, logout, setAuthUser } = useAuth();

  const [active, setActive] = useState<Tab>("dashboard");
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAvatarFile, setProfileAvatarFile] = useState<File | null>(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [profilePanel, setProfilePanel] = useState<ProfilePanel>("account");
  const [deleteOtpSending, setDeleteOtpSending] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState("");

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError?.response?.data?.message || fallback;
  };

  useEffect(() => {
    if (!user) return;

    if (user.role !== "kitchen") {
      if (user.role === "admin") router.replace("/dashboard/admin");
      else if (user.role === "dietician") router.replace("/dashboard/dietician");
      else router.replace("/dashboard/user");
      return;
    }

    setProfileName(user.username || "");
    setProfileEmail(user.email || "");
    setProfilePhone(user.phone || "");
    setProfileAvatarPreview(resolveBackendAssetUrl(user.avatar));

    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 12000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchKitchenOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payments/orders/admin/all");
      setOrders(res.data || []);
    } catch (error) {
      console.error("Failed to fetch kitchen orders", error);
      toast.error("Failed to load kitchen orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: KitchenOrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await api.put(`/payments/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status } : order)));
      toast.success("Order status updated");
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleProfileImageChange = (file: File | null) => {
    setProfileAvatarFile(file);
    if (file) {
      setProfileAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
      return;
    }
    setProfileAvatarPreview(resolveBackendAssetUrl(user?.avatar));
  };

  const handleRemoveAvatarClick = () => {
    if (!removeAvatar) {
      const confirmed = window.confirm(
        "Remove current avatar? This will apply after you click Save Profile."
      );

      if (!confirmed) return;

      setRemoveAvatar(true);
      setProfileAvatarFile(null);
      setProfileAvatarPreview("");
      return;
    }

    setRemoveAvatar(false);
    setProfileAvatarPreview(resolveBackendAssetUrl(user?.avatar));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append("username", profileName);
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
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const sendResetOtp = async () => {
    if (!profileEmail) {
      toast.error("Email is required");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: profileEmail });
      toast.success(res.data?.message || "OTP sent to your email");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to send OTP"));
    } finally {
      setSendingOtp(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileEmail || !resetOtp || !resetNewPassword) {
      toast.error("Email, OTP and new password are required");
      return;
    }

    setResettingPassword(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email: profileEmail,
        otp: resetOtp,
        newPassword: resetNewPassword,
      });
      toast.success(res.data?.message || "Password reset successful");
      setResetOtp("");
      setResetNewPassword("");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to reset password"));
    } finally {
      setResettingPassword(false);
    }
  };

  const sendDeleteOtp = async () => {
    setDeleteOtpSending(true);
    try {
      const res = await api.post("/auth/delete-account/send-otp");
      toast.success(res.data?.message || "Delete OTP sent to your email");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to send delete OTP"));
    } finally {
      setDeleteOtpSending(false);
    }
  };

  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deleteOtp.trim()) {
      toast.error("Enter OTP to delete your profile");
      return;
    }

    setDeletingAccount(true);
    try {
      const res = await api.delete("/auth/delete-account", {
        data: { otp: deleteOtp.trim() },
      });

      toast.success(res.data?.message || "Account deleted successfully");
      logout();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to delete profile"));
    } finally {
      setDeletingAccount(false);
    }
  };

  const stats = useMemo(() => {
    const processing = orders.filter((o) => o.status === "processing").length;
    const cooking = orders.filter((o) => o.status === "cooking").length;
    const packed = orders.filter((o) => o.status === "packed").length;
    const ready = orders.filter((o) => o.status === "ready_to_deliver").length;

    return {
      total: orders.length,
      processing,
      cooking,
      packed,
      ready,
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-[#12020a] text-[#ffe8ee]">
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-[#ff7a95]/20 bg-[#1c0510] p-5 lg:p-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#ff7a95]/25 px-3 py-2 text-sm text-[#ffd2de] hover:bg-[#2a0816]"
          >
            <FiArrowLeft />
            Home
          </button>

          <h1 className="text-2xl font-bold tracking-tight">Kitchen Staff</h1>
          <p className="mt-1 text-sm text-[#ffc3d3]/75">Order Operations Dashboard</p>

          <nav className="mt-6 space-y-2">
            {[
              { id: "profile", label: "My Profile", icon: <FiUser /> },
              { id: "dashboard", label: "Dashboard", icon: <FiPackage /> },
              {
                id: "orders",
                label: `Kitchen Orders (${orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length})`,
                icon: <FiClock />,
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActive(item.id as Tab);
                  if (item.id === "profile") {
                    setProfilePanel("account");
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                  active === item.id
                    ? "bg-[#8b0c2e] text-white"
                    : "bg-[#240814] text-[#ffd6e0] hover:bg-[#2f0c1a]"
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-xl border border-[#ff7a95]/20 bg-[#240814] p-4">
            <p className="text-sm font-semibold">{user?.username || "Kitchen Staff"}</p>
            <p className="text-xs text-[#ffc3d3]/70">Kitchen Team</p>
            <button
              type="button"
              onClick={logout}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#8b0c2e] px-3 py-2 text-sm font-semibold text-white hover:bg-[#a1133d]"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </aside>

        <main className="p-5 lg:p-8">
          {active === "dashboard" && (
            <section>
              <h2 className="text-3xl font-bold text-white">Kitchen Overview</h2>
              <p className="mt-1 text-sm text-[#ffd1dd]/80">
                Manage order progress from processing to ready-to-deliver.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-[#ff7a95]/25 bg-[#220713] p-4">
                  <p className="text-xs uppercase tracking-wide text-[#ffb3c6]">Total Orders</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-[#ff7a95]/25 bg-[#220713] p-4">
                  <p className="text-xs uppercase tracking-wide text-[#ffb3c6]">Processing</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stats.processing}</p>
                </div>
                <div className="rounded-2xl border border-[#ff7a95]/25 bg-[#220713] p-4">
                  <p className="text-xs uppercase tracking-wide text-[#ffb3c6]">Cooking</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stats.cooking}</p>
                </div>
                <div className="rounded-2xl border border-[#ff7a95]/25 bg-[#220713] p-4">
                  <p className="text-xs uppercase tracking-wide text-[#ffb3c6]">Packed</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stats.packed}</p>
                </div>
                <div className="rounded-2xl border border-[#ff7a95]/25 bg-[#220713] p-4">
                  <p className="text-xs uppercase tracking-wide text-[#ffb3c6]">Ready To Deliver</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stats.ready}</p>
                </div>
              </div>
            </section>
          )}

          {active === "orders" && (
            <section>
              <h2 className="text-3xl font-bold text-white">Kitchen Orders</h2>
              <p className="mt-1 text-sm text-[#ffd1dd]/80">
                Update statuses: Processing, Cooking, Packed, Ready To Deliver.
              </p>

              {loading ? (
                <div className="mt-6 rounded-2xl border border-[#ff7a95]/20 bg-[#220713] p-6">
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-[#ff7a95]/20 bg-[#220713] p-6">
                  No kitchen orders available.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {orders.map((order) => (
                    <article
                      key={order._id}
                      className="rounded-2xl border border-[#ff7a95]/20 bg-[#220713] p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-white">
                            {order.user?.username || "Unknown User"}
                          </p>
                          <p className="text-sm text-[#ffd1dd]/75">{order.user?.email || "-"}</p>
                          <p className="text-sm text-[#ffd1dd]/75">
                            {new Date(order.createdAt).toLocaleString()} · Rs. {Number(order.subtotal || 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-[#ffd1dd]/85">
                            {order.items
                              .slice(0, 3)
                              .map((item) => `${item.name} x${item.quantity}`)
                              .join(", ")}
                            {order.items.length > 3 ? " ..." : ""}
                          </p>
                        </div>

                        <div className="flex flex-col items-start gap-3 lg:items-end">
                          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff7a95]/25 px-3 py-1 text-xs text-[#ffd9e2]">
                            <FiCheckCircle />
                            {order.paymentMethod === "card" ? "Card" : "Cash"} / {order.paymentStatus}
                          </div>

                          <select
                            value={order.status}
                            disabled={updatingOrderId === order._id}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value as KitchenOrderStatus)
                            }
                            className="rounded-lg border border-[#ff7a95]/35 bg-[#1b0510] px-3 py-2 text-sm text-white outline-none"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {statusLabel[status]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {active === "profile" && (
            <section>
              <h2 className="text-3xl font-bold text-white">My Profile</h2>
              <p className="mt-1 text-sm text-[#ffd1dd]/80">Manage account settings securely.</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setProfilePanel("account")}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    profilePanel === "account"
                      ? "border-[#8b0c2e] bg-[#8b0c2e] text-white"
                      : "border-[#ff7a95]/35 bg-[#220713] text-[#ffd7e1] hover:bg-[#2f0c1a]"
                  }`}
                >
                  Account Profile
                </button>
                <button
                  type="button"
                  onClick={() => setProfilePanel("security")}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    profilePanel === "security"
                      ? "border-[#8b0c2e] bg-[#8b0c2e] text-white"
                      : "border-[#ff7a95]/35 bg-[#220713] text-[#ffd7e1] hover:bg-[#2f0c1a]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <FiLock />
                    Security
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfilePanel("delete")}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    profilePanel === "delete"
                      ? "border-[#b91c1c] bg-[#b91c1c] text-white"
                      : "border-[#f87171]/40 bg-[#3a0a12] text-[#fecaca] hover:bg-[#4b0d17]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <FiTrash2 />
                    Delete Profile
                  </span>
                </button>
              </div>

              <div className="mt-6 grid gap-5">
                {profilePanel === "account" && (
                  <form
                    onSubmit={saveProfile}
                    className="rounded-2xl border border-[#ff7a95]/20 bg-[#220713] p-5"
                  >
                    <h3 className="text-lg font-semibold text-white">Account Details</h3>

                    <div className="mt-4 flex items-center gap-4">
                      {profileAvatarPreview ? (
                        <img
                          src={profileAvatarPreview}
                          alt={profileName || "Kitchen Staff"}
                          className="h-16 w-16 rounded-full border border-[#ff7a95]/25 object-cover"
                          onError={() => setProfileAvatarPreview("")}
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#ff7a95]/25 bg-[#2b0b18] text-xl font-bold text-white">
                          {profileName?.[0]?.toUpperCase() || "K"}
                        </div>
                      )}

                      <div className="flex-1">
                          <label className="profile-file-picker" aria-label="Choose avatar">
                            <span className="profile-file-picker-btn">Choose avatar</span>
                            <span className="profile-file-picker-name">
                              {profileAvatarFile?.name || "No file chosen"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleProfileImageChange(e.target.files?.[0] || null)}
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
                            <p className="mt-2 text-xs text-[#fecaca]">Avatar will be removed when you save profile.</p>
                          )}
                      </div>
                    </div>

                    <input
                      className="mt-4 w-full rounded-lg border border-[#ff7a95]/30 bg-[#17040c] px-3 py-2 text-white outline-none"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Username"
                      required
                    />
                    <input
                      className="mt-3 w-full rounded-lg border border-[#ff7a95]/30 bg-[#17040c] px-3 py-2 text-white outline-none opacity-80"
                      type="email"
                      value={profileEmail}
                      placeholder="Email"
                      readOnly
                      disabled
                    />
                    <p className="mt-2 text-xs text-[#ffd7e1]/75">Email is locked and cannot be changed.</p>
                    <input
                      className="mt-3 w-full rounded-lg border border-[#ff7a95]/30 bg-[#17040c] px-3 py-2 text-white outline-none"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="Phone"
                    />

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="mt-4 rounded-lg bg-[#8b0c2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a2133d] disabled:opacity-60"
                    >
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </button>
                  </form>
                )}

                {profilePanel === "security" && (
                  <form
                    onSubmit={resetPassword}
                    className="rounded-2xl border border-[#ff7a95]/20 bg-[#220713] p-5"
                  >
                    <h3 className="text-lg font-semibold text-white">Reset Password (OTP)</h3>
                    <p className="mt-2 text-sm text-[#ffd7e1]/80">
                      Send OTP to your registered email and reset your password securely.
                    </p>

                    <button
                      type="button"
                      onClick={sendResetOtp}
                      disabled={sendingOtp}
                      className="mt-4 rounded-lg border border-[#ff7a95]/35 bg-[#17040c] px-4 py-2 text-sm font-semibold text-[#ffd7e1] hover:bg-[#220713] disabled:opacity-60"
                    >
                      {sendingOtp ? "Sending OTP..." : "Send OTP"}
                    </button>

                    <input
                      className="mt-4 w-full rounded-lg border border-[#ff7a95]/30 bg-[#17040c] px-3 py-2 text-white outline-none"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="Enter OTP"
                      required
                    />
                    <input
                      className="mt-3 w-full rounded-lg border border-[#ff7a95]/30 bg-[#17040c] px-3 py-2 text-white outline-none"
                      type="password"
                      minLength={6}
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />

                    <button
                      type="submit"
                      disabled={resettingPassword}
                      className="mt-4 rounded-lg bg-[#8b0c2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a2133d] disabled:opacity-60"
                    >
                      {resettingPassword ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}

                {profilePanel === "delete" && (
                  <form
                    onSubmit={deleteAccount}
                    className="rounded-2xl border border-[#f87171]/30 bg-[#3a0a12] p-5"
                  >
                    <h3 className="text-lg font-semibold text-[#fecaca]">Delete Profile</h3>
                    <p className="mt-2 text-sm text-[#fecaca]/90">
                      This action permanently deletes your account and cannot be undone.
                    </p>

                    <button
                      type="button"
                      onClick={sendDeleteOtp}
                      disabled={deleteOtpSending}
                      className="mt-4 rounded-lg border border-[#fca5a5]/40 bg-[#2f0810] px-4 py-2 text-sm font-semibold text-[#fecaca] hover:bg-[#3f0b14] disabled:opacity-60"
                    >
                      {deleteOtpSending ? "Sending OTP..." : "Send Delete OTP"}
                    </button>

                    <input
                      className="mt-4 w-full rounded-lg border border-[#fca5a5]/40 bg-[#2f0810] px-3 py-2 text-white outline-none"
                      value={deleteOtp}
                      onChange={(e) => setDeleteOtp(e.target.value)}
                      placeholder="Enter delete OTP"
                      required
                    />

                    <button
                      type="submit"
                      disabled={deletingAccount}
                      className="mt-4 rounded-lg bg-[#b91c1c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#991b1b] disabled:opacity-60"
                    >
                      {deletingAccount ? "Deleting..." : "Delete Profile"}
                    </button>
                  </form>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
