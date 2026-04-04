"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import api from "@/lib/axios";

interface Dietician {
  _id: string;
  user: { username: string; email: string };
  specialization: string;
  price: number;
  availableSlots: string[];
  rating: number;
  isVerified: boolean;
}

interface BookingModalProps {
  dietician: Dietician;
  onClose: () => void;
}

const BANKS = [
  { id: "commercial", name: "Commercial Bank", last4: "1234", expiry: "05/27", type: "VISA", holder: "Arththika" },
  { id: "hnb", name: "HNB Bank", last4: "5678", expiry: "11/26", type: "MASTER", holder: "Arththika" },
  { id: "sampath", name: "Sampath Bank", last4: "9876", expiry: "08/28", type: "VISA", holder: "Arththika" },
];

export default function BookingModal({ dietician, onClose }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<"chat" | "voice" | "video">("chat");
  const [selectedBank, setSelectedBank] = useState("commercial");
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const price = dietician.price || 1500;
  const serviceFee = 200;
  const total = price + serviceFee;

  const getDayName = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long" });
  };

  const handleScheduleNext = () => {
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Step 1 — create booking
      let bid = bookingId;
      if (!bid) {
        const res = await api.post(
          "/bookings",
          { dieticianId: dietician.user?._id || dietician._id, date, time, mode },
          { headers }
        );
        bid = res.data._id;
        setBookingId(bid);
      }

      // Step 2 — mark paid
      await api.put(`/bookings/${bid}/pay`, {}, { headers });

      toast.success("🎉 Payment successful! Dietician has been notified.");
      setTimeout(onClose, 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bank = BANKS.find((b) => b.id === selectedBank)!;

  return (
    <div className="bm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bm-modal">

        {/* HEADER */}
        <div className="bm-header">
          <div>
            <h2>Book {dietician.user?.username}</h2>
            <p className="bm-spec">{dietician.specialization}</p>
          </div>
          <button className="bm-close" onClick={onClose}>✕</button>
        </div>

        {/* STEP INDICATOR */}
        <div className="bm-steps">
          <div className={`bm-step ${step >= 1 ? "active" : ""}`}>
            <span>1</span> Schedule
          </div>
          <div className="bm-step-line" />
          <div className={`bm-step ${step >= 2 ? "active" : ""}`}>
            <span>2</span> Payment
          </div>
        </div>

        {/* ====== STEP 1: SCHEDULE ====== */}
        {step === 1 && (
          <div className="bm-body">

            {/* Date */}
            <div className="bm-field">
              <label>📅 Select Date</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
              />
              {date && <p className="bm-day-label">{getDayName(date)}</p>}
            </div>

            {/* Time Slots */}
            <div className="bm-field">
              <label>⏰ Select Time Slot</label>
              <div className="bm-slots">
                {(dietician.availableSlots?.length
                  ? dietician.availableSlots
                  : ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
                ).map((slot) => (
                  <button
                    key={slot}
                    className={`bm-slot ${time === slot ? "selected" : ""}`}
                    onClick={() => setTime(slot)}
                    type="button"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div className="bm-field">
              <label>💬 Consultation Mode</label>
              <div className="bm-modes">
                {(["chat", "voice", "video"] as const).map((m) => (
                  <button
                    key={m}
                    className={`bm-mode-btn ${mode === m ? "selected" : ""}`}
                    onClick={() => setMode(m)}
                    type="button"
                  >
                    {m === "chat" ? "💬 Chat" : m === "voice" ? "📞 Voice" : "🎥 Video"}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bm-summary">
              <div className="bm-summary-row">
                <span>Consultation Fee</span>
                <span>Rs. {price.toLocaleString()}</span>
              </div>
              <div className="bm-summary-row">
                <span>Service Fee</span>
                <span>Rs. {serviceFee}</span>
              </div>
              <div className="bm-summary-row total">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <button className="bm-next-btn" onClick={handleScheduleNext}>
              Continue to Payment →
            </button>
          </div>
        )}

        {/* ====== STEP 2: PAYMENT ====== */}
        {step === 2 && (
          <div className="bm-body">

            <button className="bm-back-btn" onClick={() => setStep(1)}>← Back</button>

            <h3 className="bm-pay-title">Choose Payment Method</h3>

            {/* Bank Cards */}
            <div className="bm-bank-list">
              {BANKS.map((b) => (
                <div
                  key={b.id}
                  className={`bm-bank-item ${selectedBank === b.id ? "active" : ""}`}
                  onClick={() => setSelectedBank(b.id)}
                >
                  <div>
                    <p className="bm-bank-name">{b.name}</p>
                    <p className="bm-bank-num">•••• •••• •••• {b.last4}</p>
                  </div>
                  <span className="bm-bank-type">{b.type}</span>
                </div>
              ))}
            </div>

            {/* Card Preview */}
            <div className={`bm-card-preview ${selectedBank}`}>
              <p className="bm-card-bank">{bank.name}</p>
              <p className="bm-card-holder">{bank.holder}</p>
              <p className="bm-card-number">•••• •••• •••• {bank.last4}</p>
              <div className="bm-card-footer">
                <span>{bank.expiry}</span>
                <span>{bank.type}</span>
              </div>
            </div>

            {/* Card Form */}
            <div className="bm-card-form">
              <input placeholder="Card Holder Name" defaultValue={bank.holder} />
              <input placeholder="Card Number" defaultValue={`4567 •••• •••• ${bank.last4}`} />
              <div className="bm-card-row">
                <input placeholder="MM/YY" defaultValue={bank.expiry} />
                <input placeholder="CVC" defaultValue="•••" />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bm-summary">
              <div className="bm-summary-row">
                <span>📅 {date} ({getDayName(date)})</span>
                <span>⏰ {time}</span>
              </div>
              <div className="bm-summary-row total">
                <span>Total Amount</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              className="bm-pay-btn"
              onClick={handlePaymentSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : `Pay Rs. ${total.toLocaleString()} & Confirm`}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}