"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify"; // 🔥 ADD THIS

export default function PaymentPage() {
  const { bookingId } = useParams();
  const router = useRouter();

  const [method, setMethod] = useState("card");

  const handlePayment = () => {
    // 🔥 TOAST SUCCESS
    toast.success("Payment Successful 🎉");

    // 🔥 redirect after 2 sec
    setTimeout(() => {
      router.push("/dietician");
    }, 2000);
  };

  return (
    <div className="payment-page">

      {/* HEADER */}
      <div className="payment-header">
        <h2>💳 Payment</h2>
        <p>Booking ID: {bookingId}</p>
      </div>

      {/* CARD */}
      <div className="payment-container">

        {/* 🔥 BANK CARD */}
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

        {/* 🔥 PAYMENT METHODS */}
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

        {/* 🔥 DETAILS */}
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

        {/*  PAY BUTTON */}
        <button className="pay-btn" onClick={handlePayment}>
          Pay Now 
        </button>

        {/* BACK */}
        <p className="back" onClick={() => router.back()}>
          ← Back to Chat
        </p>

      </div>

    </div>
  );
}