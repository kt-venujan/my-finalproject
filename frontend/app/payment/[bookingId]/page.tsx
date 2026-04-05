"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "@/lib/axios";

export default function PaymentPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const cancelled = searchParams.get("cancelled");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (cancelled) {
      setMessage("Payment cancelled. You can try again.");
      toast.info("Payment cancelled");
    }
  }, [cancelled]);

  useEffect(() => {
    if (!sessionId) return;

    const confirmPayment = async () => {
      try {
        setConfirming(true);
        await api.get(`/payments/stripe/confirm-dietician?sessionId=${sessionId}`);
        setMessage("Payment successful. Booking confirmed and dietician notified.");
        toast.success("Payment Successful");
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || "Payment confirmation failed";
        setMessage(errorMessage);
        toast.error(errorMessage);
      } finally {
        setConfirming(false);
      }
    };

    confirmPayment();
  }, [sessionId]);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const res = await api.post("/payments/stripe/create-dietician-checkout-session", {
        bookingId,
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }

      toast.error("Unable to start Stripe checkout.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const statusText = confirming
    ? "Confirming payment..."
    : message || "Complete your payment securely with Stripe.";

  return (
    <div className="payment-page">
      <div className="payment-header">
        <h2>💳 Payment</h2>
        <p>Booking ID: {bookingId}</p>
      </div>

      <div className="payment-container">
        <div className="bank-card" style={{ display: "grid", gap: 10 }}>
          <p className="card-type">Secure Stripe Checkout</p>
          <h3>Dietician Consultation Payment</h3>
          <p style={{ fontSize: 14, opacity: 0.86 }}>
            Card details are handled directly by Stripe for security.
          </p>
        </div>

        <div className="details">
          <div>
            <span>Consultation</span>
            <span>Price shown at checkout</span>
          </div>
          <div>
            <span>Service Fee</span>
            <span>Included at checkout</span>
          </div>
          <div className="total">
            <span>Status</span>
            <span>{statusText}</span>
          </div>
        </div>

        <button className="pay-btn" onClick={handlePayment} disabled={loading || confirming}>
          {loading ? "Redirecting..." : "Pay with Stripe"}
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <p className="back" onClick={() => router.back()}>
            ← Back
          </p>
          <p className="back" onClick={() => router.push("/dashboard/user")}>
            Go to Dashboard →
          </p>
        </div>
      </div>
    </div>
  );
}