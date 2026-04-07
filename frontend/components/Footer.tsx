"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { isAxiosError } from "axios";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import {
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return toast.error("Please enter a valid email address");
    }

    try {
      setLoading(true);

      await api.post("/newsletter/subscribe", { email: cleanEmail });

      toast.success("Subscribed successfully 🎉");
      setEmail("");
    } catch (error: unknown) {
      let message = "Unable to subscribe right now";

      if (isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: string; error?: string }
          | undefined;
        message = responseData?.message || responseData?.error || message;
      }

      toast.error(message);
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
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <p><Link href="/">About</Link></p>
          <p><Link href="/dietician">Services</Link></p>
          <p><Link href="/dashboard">Dashboard</Link></p>
          <p><Link href="/contact">Contact</Link></p>
        </div>

        <div className="footer-col">
          <h4>Services</h4>
          <p><Link href="/ai-assistant">AI Diet Plans</Link></p>
          <p><Link href="/dietician">Dietician Support</Link></p>
          <p><Link href="/meal-tracking">Meal Tracking</Link></p>
          <p><Link href="/kitchen">Healthy Kitchen</Link></p>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>📍 Jaffna, Sri Lanka</p>
          <p>📞 +94 77 123 4567</p>
          <p>✉ support@dietara.com</p>

          {/* ✅ SUBSCRIBE MOVED HERE */}
          <form className="subscribe-box" style={{ marginTop: "12px" }} onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading ? "..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {/* ===== BOTTOM ===== */}
      <div className="footer-bottom">
        © 2026 Dietara. All Rights Reserved.
      </div>
    </footer>
  );
}