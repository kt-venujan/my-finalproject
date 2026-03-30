"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function BookingModal({ dietician, onClose }: any) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  const handlePayment = () => {
    toast.success("Payment Success 🎉");
    onClose();
  };

  return (
    <div className="modal">

      <div className="modal-content">

        <h3>Book {dietician.name}</h3>

        <input
          placeholder="Your Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="date"
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={handlePayment}>
          Pay & Book
        </button>

        <button onClick={onClose}>Close</button>

      </div>
    </div>
  );
}