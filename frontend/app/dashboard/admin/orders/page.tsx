"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { FiPackage, FiUserCheck } from "react-icons/fi";

type KitchenOrder = {
  _id: string;
  user?: { username?: string; email?: string };
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
  items: Array<{ name: string; quantity: number }>;
};

type Booking = {
  _id: string;
  user?: { username?: string; email?: string };
  dietician?: { username?: string; email?: string };
  date: string;
  time: string;
  mode: "video" | "voice" | "chat";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid";
  dieticianApproved: boolean;
};

const orderStatusOptions: KitchenOrder["status"][] = [
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

const bookingStatusOptions: Booking["status"][] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export default function OrdersPage() {
  const [tab, setTab] = useState<"kitchen" | "bookings">("kitchen");
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, bookingsRes] = await Promise.all([
        api.get("/payments/orders/admin/all"),
        api.get("/bookings/admin/all"),
      ]);
      setKitchenOrders(ordersRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (error) {
      console.error("Failed to load admin orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingKitchenCount = useMemo(
    () => kitchenOrders.filter((o) => o.status !== "delivered").length,
    [kitchenOrders]
  );

  const pendingBookingCount = useMemo(
    () => bookings.filter((b) => b.status === "pending").length,
    [bookings]
  );

  const updateOrderStatus = async (orderId: string, status: KitchenOrder["status"]) => {
    try {
      setUpdatingId(orderId);
      await api.put(`/payments/orders/${orderId}/status`, { status });
      await fetchData();
    } catch (error) {
      console.error("Failed to update order status", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking["status"]) => {
    try {
      setUpdatingId(bookingId);
      await api.put(`/bookings/admin/${bookingId}`, { status });
      await fetchData();
    } catch (error) {
      console.error("Failed to update booking status", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="adm-section">
      <div className="adm-page-head">
        <h1 className="adm-title">Orders & Bookings</h1>
        <p>Handle kitchen food orders and dietician consultations from one panel.</p>
      </div>

      <div className="adm-tab-row">
        <button
          className={tab === "kitchen" ? "adm-tab active" : "adm-tab"}
          onClick={() => setTab("kitchen")}
        >
          <FiPackage />
          Kitchen Orders ({pendingKitchenCount})
        </button>
        <button
          className={tab === "bookings" ? "adm-tab active" : "adm-tab"}
          onClick={() => setTab("bookings")}
        >
          <FiUserCheck />
          Dietician Bookings ({pendingBookingCount})
        </button>
      </div>

      {loading ? (
        <div className="adm-empty">Loading records...</div>
      ) : tab === "kitchen" ? (
        kitchenOrders.length === 0 ? (
          <div className="adm-empty">No kitchen orders found.</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {kitchenOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>{order.user?.username || "Unknown"}</strong>
                      <p>{order.user?.email || "-"}</p>
                    </td>
                    <td>
                      {order.items
                        .slice(0, 2)
                        .map((i) => `${i.name} x${i.quantity}`)
                        .join(", ")}
                      {order.items.length > 2 ? " ..." : ""}
                    </td>
                    <td>Rs. {Number(order.subtotal || 0).toLocaleString()}</td>
                    <td>
                      <span className={`adm-pill ${order.paymentStatus}`}>
                        {order.paymentMethod === "cash_on_delivery" ? "Cash" : "Card"} / {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={(e) =>
                          updateOrderStatus(order._id, e.target.value as KitchenOrder["status"])
                        }
                        className="adm-select"
                      >
                        {orderStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : bookings.length === 0 ? (
        <div className="adm-empty">No bookings found.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Dietician</th>
                <th>Schedule</th>
                <th>Payment</th>
                <th>Approval</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <strong>{booking.user?.username || "Unknown"}</strong>
                    <p>{booking.user?.email || "-"}</p>
                  </td>
                  <td>
                    <strong>{booking.dietician?.username || "Unknown"}</strong>
                    <p>{booking.dietician?.email || "-"}</p>
                  </td>
                  <td>
                    {booking.date} {booking.time}
                    <p>{booking.mode}</p>
                  </td>
                  <td>
                    <span className={`adm-pill ${booking.paymentStatus}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={booking.dieticianApproved ? "adm-pill approved" : "adm-pill pending"}>
                      {booking.dieticianApproved ? "approved" : "waiting"}
                    </span>
                  </td>
                  <td>
                    <select
                      value={booking.status}
                      disabled={updatingId === booking._id}
                      onChange={(e) =>
                        updateBookingStatus(
                          booking._id,
                          e.target.value as Booking["status"]
                        )
                      }
                      className="adm-select"
                    >
                      {bookingStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}