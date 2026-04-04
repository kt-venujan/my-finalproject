"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      return toast.error("Valid email enter please");
    }

    try {
      setLoading(true);

      await api.post("/newsletter/subscribe", { email });

      toast.success("Subscribed successfully 🎉");
      setEmail("");
    } catch (err) {
      console.log(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      {/* ===== MAIN FOOTER ===== */}
      <div className="footer-main">
        <div className="footer-col">
          <h2>Dietara</h2>
          <p>
            We help you build healthy eating habits with AI-powered diet plans,
            expert dieticians, and smart meal tracking.
          </p>

          {/* SOCIAL ICONS */}
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank">
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <p>About</p>
          <p>Services</p>
          <p>Dashboard</p>
          <p>Contact</p>
        </div>

        <div className="footer-col">
          <h4>Services</h4>
          <p>AI Diet Plans</p>
          <p>Dietician Support</p>
          <p>Meal Tracking</p>
          <p>Healthy Kitchen</p>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>📍 Jaffna, Sri Lanka</p>
          <p>📞 +94 77 123 4567</p>
          <p>✉ support@dietara.com</p>

          {/* ✅ SUBSCRIBE MOVED HERE */}
          <div className="subscribe-box" style={{ marginTop: "12px" }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={handleSubscribe} disabled={loading}>
              {loading ? "..." : "Subscribe"}
            </button>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM ===== */}
      <div className="footer-bottom">
        © 2026 Dietara. All Rights Reserved.
      </div>
    </footer>
  );
}