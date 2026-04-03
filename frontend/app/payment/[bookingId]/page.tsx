"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "@/lib/axios";

export default function PaymentPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const router = useRouter();

  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      await api.put(`/bookings/${bookingId}/pay`, {
        method,
      });

      toast.success("Payment Successful 🎉");

      setTimeout(() => {
        router.push("/dashboard/user");
      }, 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Payment failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-header">
        <h2>💳 Payment</h2>
        <p>Booking ID: {bookingId}</p>
      </div>

      <div className="payment-container">
        <div className="bank-card">
          <p className="card-type">Bank Card</p>
          <h3>Arththika</h3>

          <div className="card-number">
            3417 •••• •••• 2115
          </div>

          <div className="card-bottom">
            <span>12/24</span>
          </div>
        </div>

        <div className="methods">
          <button
            className={method === "card" ? "active" : ""}
            onClick={() => setMethod("card")}
          >
            💳 Card
          </button>

          <button
            className={method === "paypal" ? "active" : ""}
            onClick={() => setMethod("paypal")}
          >
            🅿️ PayPal
          </button>

          <button
            className={method === "cash" ? "active" : ""}
            onClick={() => setMethod("cash")}
          >
            💵 Cash
          </button>
        </div>

        <div className="details">
          <div>
            <span>Consultation</span>
            <span>Rs. 1500</span>
          </div>
          <div>
            <span>Service Fee</span>
            <span>Rs. 200</span>
          </div>
          <div className="total">
            <span>Total</span>
            <span>Rs. 1700</span>
          </div>
        </div>

        <button className="pay-btn" onClick={handlePayment} disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>

        <p className="back" onClick={() => router.back()}>
          ← Back
        </p>
      </div>
    </div>
  );
}