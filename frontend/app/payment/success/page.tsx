"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AxiosError } from "axios";
import api from "@/lib/axios";

type PaymentSummary = {
  sessionId?: string;
  paymentStatus?: string;
  amountTotal?: number;
  currency?: string;
};

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  size?: "small" | "medium" | "large";
  bundleOfferName?: string;
};

type KitchenOrder = {
  _id: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  items: OrderItem[];
  createdAt?: string;
};

type Booking = {
  _id: string;
  date?: string;
  time?: string;
  mode?: string;
  status?: string;
  paymentStatus?: string;
  user?: {
    username?: string;
    email?: string;
  };
  dietician?: {
    username?: string;
    email?: string;
  };
};

type SuccessPayload =
  | {
      type: "order";
      title: string;
      subtitle: string;
      order: KitchenOrder;
      paymentSummary?: PaymentSummary;
    }
  | {
      type: "dietician";
      title: string;
      subtitle: string;
      booking: Booking;
      paymentSummary?: PaymentSummary;
    };

const formatMoney = (amount?: number, currency = "LKR") => {
  const safeAmount = Number(amount || 0);
  const safeCurrency = String(currency || "LKR").toUpperCase();

  try {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `${safeCurrency} ${safeAmount.toFixed(2)}`;
  }
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;

  return new Date(timestamp).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const typeParam = String(searchParams.get("type") || "order").toLowerCase();
  const paymentType = typeParam === "dietician" ? "dietician" : "order";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState<SuccessPayload | null>(null);

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosError = err as AxiosError<{ message?: string; error?: string }>;
    return axiosError?.response?.data?.message || axiosError?.response?.data?.error || fallback;
  };

  useEffect(() => {
    const confirm = async () => {
      if (!sessionId) {
        setError("Stripe session is missing. Please retry from checkout.");
        setLoading(false);
        return;
      }

      try {
        if (paymentType === "dietician") {
          const res = await api.get(`/payments/stripe/confirm-dietician?sessionId=${sessionId}`);

          setPayload({
            type: "dietician",
            title: "Consultation Payment Successful",
            subtitle: "Your booking is confirmed and your dietician can now proceed.",
            booking: res.data?.booking,
            paymentSummary: res.data?.paymentSummary,
          });
        } else {
          const res = await api.get(`/payments/stripe/confirm?sessionId=${sessionId}`);
          localStorage.removeItem("kitchenCart");

          setPayload({
            type: "order",
            title: "Order Payment Successful",
            subtitle: "Your kitchen order was confirmed successfully.",
            order: res.data?.order,
            paymentSummary: res.data?.paymentSummary,
          });
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Payment confirmation failed"));
      } finally {
        setLoading(false);
      }
    };

    confirm();
  }, [sessionId, paymentType]);

  const headerNote = useMemo(() => {
    if (!payload) return "";
    if (payload.type === "dietician") {
      return `Session ${payload.paymentSummary?.sessionId || "-"}`;
    }
    return `Order ${payload.order?._id || "-"}`;
  }, [payload]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-[0_22px_80px_rgba(16,185,129,0.18)] backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 pb-6">
            <div>
              <p className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-800">
                Payment Confirmed
              </p>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                {payload?.title || "Payment Status"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {payload?.subtitle || "We are validating your transaction details."}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 px-4 py-3 text-right text-white">
              <p className="text-xs uppercase tracking-wide text-slate-300">Reference</p>
              <p className="text-sm font-semibold">{headerNote || "Pending"}</p>
            </div>
          </div>

          {loading && (
            <div className="py-16 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
              <p className="mt-4 text-sm font-medium text-slate-600">Confirming payment with Stripe...</p>
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6">
              <h2 className="text-lg font-semibold text-rose-900">Payment confirmation failed</h2>
              <p className="mt-2 text-sm text-rose-700">{error}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={paymentType === "dietician" ? "/dashboard/user" : "/checkout"}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Try Again
                </Link>
                <Link
                  href="/"
                  className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && payload?.type === "order" && (
            <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Order Details</h2>
                <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  <p><span className="font-semibold">Order ID:</span> {payload.order._id}</p>
                  <p><span className="font-semibold">Order Status:</span> {payload.order.status}</p>
                  <p><span className="font-semibold">Payment Status:</span> {payload.order.paymentStatus}</p>
                  <p><span className="font-semibold">Placed At:</span> {formatDateTime(payload.order.createdAt)}</p>
                </div>

                <div className="mt-5 space-y-3">
                  {payload.order.items?.map((item, idx) => (
                    <div
                      key={`${item.name}-${idx}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="mt-1 text-xs text-slate-600">
                            Qty {item.quantity}
                            {item.size ? ` • ${item.size}` : ""}
                            {item.bundleOfferName ? ` • Bundle ${item.bundleOfferName}` : ""}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatMoney(Number(item.price || 0) * Number(item.quantity || 0), payload.paymentSummary?.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Payment Summary</h3>
                  <p className="mt-3 text-3xl font-bold text-emerald-800">
                    {formatMoney(payload.paymentSummary?.amountTotal ?? payload.order.subtotal, payload.paymentSummary?.currency)}
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Stripe Session: {payload.paymentSummary?.sessionId || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Next Steps</h3>
                  <p className="mt-2 text-sm text-slate-700">
                    You can continue ordering from the kitchen or track updates in your dashboard.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/kitchen"
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Continue Shopping
                    </Link>
                    <Link
                      href="/dashboard/user"
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                    >
                      User Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {!loading && !error && payload?.type === "dietician" && (
            <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Consultation Details</h2>
                <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  <p><span className="font-semibold">Booking ID:</span> {payload.booking._id}</p>
                  <p><span className="font-semibold">Consultation Mode:</span> {payload.booking.mode || "-"}</p>
                  <p><span className="font-semibold">Date:</span> {payload.booking.date || "-"}</p>
                  <p><span className="font-semibold">Time:</span> {payload.booking.time || "-"}</p>
                  <p><span className="font-semibold">Booking Status:</span> {payload.booking.status || "-"}</p>
                  <p><span className="font-semibold">Payment Status:</span> {payload.booking.paymentStatus || "-"}</p>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Dietician</p>
                  <p className="mt-1">{payload.booking.dietician?.username || "Not available"}</p>
                  <p className="text-slate-600">{payload.booking.dietician?.email || "-"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Payment Summary</h3>
                  <p className="mt-3 text-3xl font-bold text-cyan-800">
                    {formatMoney(payload.paymentSummary?.amountTotal, payload.paymentSummary?.currency)}
                  </p>
                  <p className="mt-1 text-sm text-cyan-700">
                    Stripe Session: {payload.paymentSummary?.sessionId || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Next Steps</h3>
                  <p className="mt-2 text-sm text-slate-700">
                    Track booking updates in your dashboard, or open your consultation call room.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/call/${payload.booking._id}`}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Open Call Room
                    </Link>
                    <Link
                      href="/dashboard/user"
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                    >
                      User Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
