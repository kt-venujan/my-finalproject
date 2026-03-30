"use client";

import { useParams, useRouter } from "next/navigation";

export default function CallPage() {
  const { bookingId } = useParams();
  const router = useRouter();

  return (
    <div className="call-page">

      {/* HEADER */}
      <div className="call-header">
        <h2>📞 Dietician Call</h2>
        <p>Booking ID: {bookingId}</p>
      </div>

      {/* CALL BOX */}
      <div className="call-container">

        <div className="call-card">
          <h1>Calling Dietician...</h1>
          <p>Please wait while we connect your session</p>

          <div className="call-buttons">
            <button className="end-btn" onClick={() => router.push("/dietician")}>
              ❌ End Call
            </button>

            <button className="mute-btn">
              🔇 Mute
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}