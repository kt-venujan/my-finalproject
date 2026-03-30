"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const { bookingId } = useParams();
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages([...messages, { text: message, sender: "user" }]);
    setMessage("");
  };

  return (
    <div className="chat-page">

      {/* 🔥 HEADER */}
      <div className="chat-top">
        <div>
          <h2>💬 Dietician Chat</h2>
          <p>ID: {bookingId}</p>
        </div>

        <div className="chat-actions">
          <button onClick={() => router.push(`/call/${bookingId}`)}>
            📞 Call
          </button>

          <button onClick={() => router.push(`/payment/${bookingId}`)}>
            💳 Pay
          </button>
        </div>
      </div>

      {/* 🔥 CHAT AREA */}
      <div className="chat-body">
        {messages.length === 0 && (
          <div className="empty">
            <h3>Start your consultation 💬</h3>
            <p>Ask your dietician anything</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`bubble ${msg.sender === "user" ? "right" : "left"}`}
          >
            {msg.text}
          </div>
        ))}

        <div ref={chatEndRef}></div>
      </div>

      {/* 🔥 INPUT */}
      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />

        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
}