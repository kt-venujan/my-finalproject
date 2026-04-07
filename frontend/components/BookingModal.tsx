"use client";

import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiMessageCircle,
  FiPhone,
  FiVideo,
  FiX,
} from "react-icons/fi";

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

export default function BookingModal({ dietician, onClose }: BookingModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<"chat" | "voice" | "video">("chat");
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const price = dietician.price || 1500;
  const serviceFeeByMode: Record<"chat" | "voice" | "video", number> = {
    chat: 200,
    voice: 200,
    video: 350,
  };
  const serviceFee = serviceFeeByMode[mode];
  const total = price + serviceFee;

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<{ message?: string; error?: string }>;
    return error?.response?.data?.message || error?.response?.data?.error || fallback;
  };

  const getDayName = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long" });
  };

  const getModeMeta = (selectedMode: "chat" | "voice" | "video") => {
    if (selectedMode === "chat") {
      return { label: "Chat", icon: <FiMessageCircle className="h-4 w-4" /> };
    }
    if (selectedMode === "voice") {
      return { label: "Voice", icon: <FiPhone className="h-4 w-4" /> };
    }
    return { label: "Video", icon: <FiVideo className="h-4 w-4" /> };
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
      const res = await api.post("/payments/stripe/create-dietician-checkout-session", {
        bookingId,
        dieticianId: dietician.user?._id || dietician._id,
        date,
        time,
        mode,
      });

      if (res.data?.bookingId) {
        setBookingId(String(res.data.bookingId));
      }

      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }

      toast.error("Unable to start Stripe checkout.");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Payment failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const modalNode = (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-[8px] z-[9999] flex items-center justify-center p-5 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white text-black rounded-[24px] w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)] animate-in slide-in-from-bottom-8 duration-300">

        {/* HEADER */}
        <div className="flex justify-between items-start px-7 pt-7 pb-4 border-b border-[#f0f0f0]">
          <div>
            <h2 className="text-[22px] text-[#1a1a2e] m-0 font-bold">Book {dietician.user?.username}</h2>
            <p className="text-black text-[14px] mt-1">{dietician.specialization}</p>
          </div>
          <button className="bg-[#f5f5f5] hover:bg-[#e0e0e0] border-none w-9 h-9 rounded-full text-[18px] cursor-pointer flex items-center justify-center transition-colors duration-200" onClick={onClose} aria-label="Close booking modal"><FiX className="h-4 w-4" /></button>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center gap-3 px-7 pt-5 pb-2.5">
          <div className={`flex items-center gap-2 text-[14px] font-semibold ${step >= 1 ? "text-black" : "text-black"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold ${step >= 1 ? "bg-[#8b0c2e] text-white" : "bg-[#eee] text-black"}`}>1</span> Schedule
          </div>
          <div className="w-10 h-[2px] bg-[#e0e0e0]" />
          <div className={`flex items-center gap-2 text-[14px] font-semibold ${step >= 2 ? "text-black" : "text-black"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold ${step >= 2 ? "bg-[#8b0c2e] text-white" : "bg-[#eee] text-black"}`}>2</span> Payment
          </div>
        </div>

        {/* ====== STEP 1: SCHEDULE ====== */}
        {step === 1 && (
          <div className="px-7 pb-7 pt-5">

            {/* Date */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-[14px] font-semibold text-[#333] mb-2"><FiCalendar className="h-4 w-4 text-[#8b0c2e]" />Select Date</label>
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
              <label className="flex items-center gap-2 text-[14px] font-semibold text-[#333] mb-2"><FiClock className="h-4 w-4 text-[#8b0c2e]" />Select Time Slot</label>
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
              <label className="flex items-center gap-2 text-[14px] font-semibold text-[#333] mb-2"><FiMessageCircle className="h-4 w-4 text-[#8b0c2e]" />Consultation Mode</label>
              <div className="flex gap-2.5">
                {(["chat", "voice", "video"] as const).map((m) => {
                  const modeMeta = getModeMeta(m);
                  return (
                    <button
                      key={m}
                      className={`flex-1 py-3 border-2 rounded-xl cursor-pointer text-[14px] font-semibold transition-colors duration-200 text-center inline-flex items-center justify-center gap-2 ${mode === m ? "bg-[#8b0c2e] text-white border-[#8b0c2e]" : "bg-[#fafafa] border-[#e8e8e8] text-[#333] hover:border-[#8b0c2e]"}`}
                      onClick={() => setMode(m)}
                      type="button"
                    >
                      {modeMeta.icon}
                      {modeMeta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#f8f5f7] rounded-2xl p-4 my-5">
              <div className="flex justify-between py-1.5 text-[14px] text-[#555]">
                <span>Consultation Fee</span>
                <span>Rs. {price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[14px] text-black">
                <span>Service Fee ({mode === "video" ? "Video" : "Chat/Voice"})</span>
                <span>Rs. {serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[14px] text-black border-t border-[#e0d5da] mt-2 pt-3 font-bold !text-[16px]">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <button className="w-full p-3.5 border-none rounded-xl text-[16px] font-bold cursor-pointer transition-all duration-300 bg-gradient-to-br from-[#8b0c2e] to-[#c4234a] text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(139,12,46,0.35)] inline-flex items-center justify-center gap-2" onClick={handleScheduleNext}>
              Continue to Payment
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ====== STEP 2: PAYMENT ====== */}
        {step === 2 && (
          <div className="px-7 pb-7 pt-5">

            <button className="bg-transparent border-none text-[#8b0c2e] font-semibold cursor-pointer mb-4 text-[14px] p-0 hover:underline inline-flex items-center gap-2" onClick={() => setStep(1)}><FiArrowLeft className="h-4 w-4" />Back</button>

            <h3 className="text-[18px] text-[#1a1a2e] mb-4 font-bold">Secure Card Payment via Stripe</h3>

            <div className="rounded-2xl p-4 bg-[#f8f5f7] border border-[#ead5dd] mb-4">
              <p className="text-[14px] text-black leading-6">
                You will be redirected to Stripe Checkout to complete your payment securely.
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-[#f8f5f7] rounded-2xl p-4 my-5">
              <div className="flex justify-between py-1.5 text-[14px] text-black">
                <span className="inline-flex items-center gap-2"><FiCalendar className="h-4 w-4 text-[#8b0c2e]" />{date} ({getDayName(date)})</span>
                <span className="inline-flex items-center gap-2"><FiClock className="h-4 w-4 text-[#8b0c2e]" />{time}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[14px] text-[#555]">
                <span>Consultation Fee</span>
                <span>Rs. {price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[14px] text-black">
                <span>Service Fee ({mode === "video" ? "Video" : "Chat/Voice"})</span>
                <span>Rs. {serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[14px] text-black border-t border-[#e0d5da] mt-2 pt-3 font-bold !text-[16px]">
                <span>Total Amount</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              className="w-full p-3.5 border-none rounded-xl text-[16px] font-bold cursor-pointer transition-all duration-300 bg-gradient-to-br from-[#8b0c2e] to-[#c4234a] text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(139,12,46,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handlePaymentSubmit}
              disabled={loading}
            >
              {loading ? "Redirecting to Stripe..." : `Pay Rs. ${total.toLocaleString()} with Stripe`}
            </button>
          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}