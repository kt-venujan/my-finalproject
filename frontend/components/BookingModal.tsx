"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import api from "@/lib/axios";

interface Dietician {
  _id: string;
  user: { _id?: string; username: string; email: string };
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
  { id: "commercial", name: "Commercial Bank", last4: "1234", expiry: "05/27", type: "VISA", holder: "Arththika", gradient: "from-[#1a1a2e] to-[#3a1f5e]" },
  { id: "hnb", name: "HNB Bank", last4: "5678", expiry: "11/26", type: "MASTER", holder: "Arththika", gradient: "from-[#0f3460] to-[#16213e]" },
  { id: "sampath", name: "Sampath Bank", last4: "9876", expiry: "08/28", type: "VISA", holder: "Arththika", gradient: "from-[#8b0c2e] to-[#c4234a]" },
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
    <div className="fixed inset-0 bg-black/55 backdrop-blur-[8px] z-[9999] flex items-center justify-center p-5 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[24px] w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)] animate-in slide-in-from-bottom-8 duration-300">

        {/* HEADER */}
        <div className="flex justify-between items-start px-7 pt-7 pb-4 border-b border-[#f0f0f0]">
          <div>
            <h2 className="text-[22px] text-[#1a1a2e] m-0 font-bold">Book {dietician.user?.username}</h2>
            <p className="text-[#8b0c2e] text-[14px] mt-1">{dietician.specialization}</p>
          </div>
          <button className="bg-[#f5f5f5] hover:bg-[#e0e0e0] border-none w-9 h-9 rounded-full text-[18px] cursor-pointer flex items-center justify-center transition-colors duration-200" onClick={onClose}>✕</button>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center gap-3 px-7 pt-5 pb-2.5">
          <div className={`flex items-center gap-2 text-[14px] font-semibold ${step >= 1 ? "text-[#8b0c2e]" : "text-[#aaa]"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold ${step >= 1 ? "bg-[#8b0c2e] text-white" : "bg-[#eee] text-[#aaa]"}`}>1</span> Schedule
          </div>
          <div className="w-10 h-[2px] bg-[#e0e0e0]" />
          <div className={`flex items-center gap-2 text-[14px] font-semibold ${step >= 2 ? "text-[#8b0c2e]" : "text-[#aaa]"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold ${step >= 2 ? "bg-[#8b0c2e] text-white" : "bg-[#eee] text-[#aaa]"}`}>2</span> Payment
          </div>
        </div>

        {/* ====== STEP 1: SCHEDULE ====== */}
        {step === 1 && (
          <div className="px-7 pb-7 pt-5">

            {/* Date */}
            <div className="mb-5">
              <label className="block text-[14px] font-semibold text-[#333] mb-2">📅 Select Date</label>
              <input
                type="date"
                className="w-full px-3.5 py-3 border-2 border-[#e8e8e8] rounded-xl text-[14px] outline-none transition-colors duration-200 bg-[#fafafa] focus:border-[#8b0c2e]"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
              />
              {date && <p className="text-[#8b0c2e] text-[13px] mt-1.5 font-medium">{getDayName(date)}</p>}
            </div>

            {/* Time Slots */}
            <div className="mb-5">
              <label className="block text-[14px] font-semibold text-[#333] mb-2">⏰ Select Time Slot</label>
              <div className="flex flex-wrap gap-2.5">
                {(dietician.availableSlots?.length
                  ? dietician.availableSlots
                  : ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
                ).map((slot) => (
                  <button
                    key={slot}
                    className={`px-[18px] py-2.5 border-2 rounded-xl cursor-pointer text-[14px] font-semibold transition-colors duration-200 ${time === slot ? "bg-[#8b0c2e] text-white border-[#8b0c2e]" : "bg-[#fafafa] border-[#e8e8e8] text-[#333] hover:border-[#8b0c2e] hover:text-[#8b0c2e]"}`}
                    onClick={() => setTime(slot)}
                    type="button"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div className="mb-5">
              <label className="block text-[14px] font-semibold text-[#333] mb-2">💬 Consultation Mode</label>
              <div className="flex gap-2.5">
                {(["chat", "voice", "video"] as const).map((m) => (
                  <button
                    key={m}
                    className={`flex-1 py-3 border-2 rounded-xl cursor-pointer text-[14px] font-semibold transition-colors duration-200 text-center ${mode === m ? "bg-[#8b0c2e] text-white border-[#8b0c2e]" : "bg-[#fafafa] border-[#e8e8e8] text-[#333] hover:border-[#8b0c2e]"}`}
                    onClick={() => setMode(m)}
                    type="button"
                  >
                    {m === "chat" ? "💬 Chat" : m === "voice" ? "📞 Voice" : "🎥 Video"}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#f8f5f7] rounded-2xl p-4 my-5">
              <div className="flex justify-between py-1.5 text-[14px] text-[#555]">
                <span>Consultation Fee</span>
                <span>Rs. {price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[14px] text-[#555]">
                <span>Service Fee</span>
                <span>Rs. {serviceFee}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[14px] text-[#555] border-t border-[#e0d5da] mt-2 pt-3 font-bold text-[#8b0c2e] !text-[16px]">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <button className="w-full p-3.5 border-none rounded-xl text-[16px] font-bold cursor-pointer transition-all duration-300 bg-gradient-to-br from-[#8b0c2e] to-[#c4234a] text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(139,12,46,0.35)]" onClick={handleScheduleNext}>
              Continue to Payment →
            </button>
          </div>
        )}

        {/* ====== STEP 2: PAYMENT ====== */}
        {step === 2 && (
          <div className="px-7 pb-7 pt-5">

            <button className="bg-transparent border-none text-[#8b0c2e] font-semibold cursor-pointer mb-4 text-[14px] p-0 hover:underline" onClick={() => setStep(1)}>← Back</button>

            <h3 className="text-[18px] text-[#1a1a2e] mb-4 font-bold">Choose Payment Method</h3>

            {/* Bank Cards */}
            <div className="flex flex-col gap-2.5 mb-5">
              {BANKS.map((b) => (
                <div
                  key={b.id}
                  className={`flex justify-between items-center px-4 py-3.5 border-2 rounded-xl cursor-pointer transition-colors duration-200 ${selectedBank === b.id ? "border-[#8b0c2e] bg-[#fdf2f5]" : "border-[#eee]"}`}
                  onClick={() => setSelectedBank(b.id)}
                >
                  <div>
                    <p className="font-semibold text-[#333] text-[14px]">{b.name}</p>
                    <p className="text-[#888] text-[12px]">•••• •••• •••• {b.last4}</p>
                  </div>
                  <span className="font-bold text-[#8b0c2e] text-[13px]">{b.type}</span>
                </div>
              ))}
            </div>

            {/* Card Preview */}
            <div className={`rounded-2xl p-6 text-white mb-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)] bg-gradient-to-br ${bank.gradient}`}>
              <p className="text-[12px] opacity-80">{bank.name}</p>
              <p className="text-[16px] font-bold my-2">{bank.holder}</p>
              <p className="text-[18px] tracking-[2px] my-3">•••• •••• •••• {bank.last4}</p>
              <div className="flex justify-between text-[14px] opacity-80">
                <span>{bank.expiry}</span>
                <span>{bank.type}</span>
              </div>
            </div>

            {/* Card Form */}
            <div className="flex flex-col gap-2.5 mb-4">
              <input className="w-full px-3.5 py-3 border-2 border-[#e8e8e8] rounded-xl text-[14px] outline-none bg-[#fafafa] focus:border-[#8b0c2e]" placeholder="Card Holder Name" defaultValue={bank.holder} />
              <input className="w-full px-3.5 py-3 border-2 border-[#e8e8e8] rounded-xl text-[14px] outline-none bg-[#fafafa] focus:border-[#8b0c2e]" placeholder="Card Number" defaultValue={`4567 •••• •••• ${bank.last4}`} />
              <div className="flex gap-2.5">
                <input className="flex-1 px-3.5 py-3 border-2 border-[#e8e8e8] rounded-xl text-[14px] outline-none bg-[#fafafa] focus:border-[#8b0c2e]" placeholder="MM/YY" defaultValue={bank.expiry} />
                <input className="flex-1 px-3.5 py-3 border-2 border-[#e8e8e8] rounded-xl text-[14px] outline-none bg-[#fafafa] focus:border-[#8b0c2e]" placeholder="CVC" defaultValue="•••" />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-[#f8f5f7] rounded-2xl p-4 my-5">
              <div className="flex justify-between py-1.5 text-[14px] text-[#555]">
                <span>📅 {date} ({getDayName(date)})</span>
                <span>⏰ {time}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[14px] text-[#555] border-t border-[#e0d5da] mt-2 pt-3 font-bold text-[#8b0c2e] !text-[16px]">
                <span>Total Amount</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              className="w-full p-3.5 border-none rounded-xl text-[16px] font-bold cursor-pointer transition-all duration-300 bg-gradient-to-br from-[#8b0c2e] to-[#c4234a] text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(139,12,46,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
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