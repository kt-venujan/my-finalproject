"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function DieticianPage() {
  const [dieticians, setDieticians] = useState<any[]>([]);
  const [filter, setFilter] = useState("available");

  const [selected, setSelected] = useState<any>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState("chat");

  const [selectedCard, setSelectedCard] = useState("commercial");

  useEffect(() => {
    setDieticians([
      { _id: "1", user: { username: "Dr. Aisha" }, specialization: "Weight Loss", available: true },
      { _id: "2", user: { username: "Dr. Rahul" }, specialization: "Diabetes", available: true },
      { _id: "3", user: { username: "Dr. Priya" }, specialization: "Heart Health", available: true },
      { _id: "4", user: { username: "Dr. Arjun" }, specialization: "Sports Nutrition", available: true },
      { _id: "5", user: { username: "Dr. Kumar" }, specialization: "Women's Health", available: false },
      { _id: "6", user: { username: "Dr. Sneha" }, specialization: "PCOS", available: false },
      { _id: "7", user: { username: "Dr. Meena" }, specialization: "Child Nutrition", available: true },
      { _id: "8", user: { username: "Dr. Sanjay" }, specialization: "Muscle Gain", available: true },
      { _id: "9", user: { username: "Dr. Kavya" }, specialization: "Pregnancy Diet", available: false },
      { _id: "10", user: { username: "Dr. Nimal" }, specialization: "General Diet", available: true },
    ]);
  }, []);

  const filtered = dieticians.filter((d: any) =>
    filter === "available" ? d.available : !d.available
  );

 const handlePaymentSubmit = () => {
  if (!date || !time) {
    toast.error("Select date & time ");
    return;
  }

  toast.success("Payment Successful 🎉");
  setSelected(null);
};

  return (
    <div className="diet-modern">

      {/* HERO */}
      <div className="hero">
        <div>
          <h1>Dieticians</h1>
          <p>Book your diet consultation with a professional dietician.</p>
        </div>
        <img src="/doctor.png" />
      </div>

      {/* FILTER */}
      <div className="filter">
        <button className={filter === "available" ? "active" : ""} onClick={() => setFilter("available")}>
          ● Available
        </button>
        <button className={filter === "not" ? "active" : ""} onClick={() => setFilter("not")}>
          ○ Not Available
        </button>
      </div>

      {/* GRID */}
      <div className="grid">
        {filtered.map((d: any) => (
          <div key={d._id} className={`card ${!d.available ? "disabled" : ""}`}>
            <img src="/doc.jpg" />

            <div className="info">
              <h3>{d.user.username}</h3>
              <p>{d.specialization}</p>
              ⭐⭐⭐⭐⭐ 4.8
            </div>

            <div className="right">
              <span className={d.available ? "yes" : "no"}>
                {d.available ? "Available" : "Not Available"}
              </span>

              <button disabled={!d.available} onClick={() => setSelected(d)}>
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 MODAL */}
      {selected && (
  <div className="modal">

    <div className="modal-box split">

      {/* LEFT */}
      <div className="left">

        <h2>Book {selected.user.username}</h2>

        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Time</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

        <label>Mode</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="chat">Chat</option>
          <option value="call">Call</option>
        </select>

        <p>Consultation: Rs.1500</p>
        <p>Service Fee: Rs.200</p>
        <b>Total: Rs.1700</b>

        <button className="close" onClick={() => setSelected(null)}>
          Cancel
        </button>
      </div>

      {/* RIGHT */}
      <div className="right-panel">

        <h4>Choose Payment Method</h4>

        {/* 🔥 CARD LIST */}
        <div
          className={`card-select ${selectedCard === "commercial" ? "active" : ""}`}
          onClick={() => setSelectedCard("commercial")}
        >
          <p>Commercial Bank</p>
          <span>4567 •••• •••• 1234</span>
        </div>

        <div
          className={`card-select ${selectedCard === "hnb" ? "active" : ""}`}
          onClick={() => setSelectedCard("hnb")}
        >
          <p>HNB Bank</p>
          <span>4578 •••• •••• 5678</span>
        </div>

        <div
          className={`card-select ${selectedCard === "sampath" ? "active" : ""}`}
          onClick={() => setSelectedCard("sampath")}
        >
          <p>Sampath Bank</p>
          <span>4599 •••• •••• 9876</span>
        </div>

        {/* 🔥 DYNAMIC CARD UI */}
        <div className={`card-ui ${selectedCard}`}>

          {selectedCard === "commercial" && (
            <>
              <p>Commercial Bank</p>
              <h3>Arththika</h3>
              <div className="card-number">4567 •••• •••• 1234</div>
              <div className="card-bottom">
                <span>05/27</span>
                <span>VISA</span>
              </div>
            </>
          )}

          {selectedCard === "hnb" && (
            <>
              <p>HNB Bank</p>
              <h3>Arththika</h3>
              <div className="card-number">4578 •••• •••• 5678</div>
              <div className="card-bottom">
                <span>11/26</span>
                <span>MASTER</span>
              </div>
            </>
          )}

          {selectedCard === "sampath" && (
            <>
              <p>Sampath Bank</p>
              <h3>Arththika</h3>
              <div className="card-number">4599 •••• •••• 9876</div>
              <div className="card-bottom">
                <span>08/28</span>
                <span>VISA</span>
              </div>
            </>
          )}

        </div>

        {/* 🔥 CARD FORM */}
        <div className="card-details">

          <input placeholder="Card Holder Name" />
          <input placeholder="Card Number" />

          <div className="row">
            <input placeholder="MM/YY" />
            <input placeholder="CVC" />
          </div>

         <button className="submit-btn" onClick={handlePaymentSubmit}>
       Submit Payment
         </button>

        </div>

      </div>

    </div>
  </div>
)}
    

    </div>
  );
}