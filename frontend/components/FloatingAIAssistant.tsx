"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiChevronUp, FiMessageCircle } from "react-icons/fi";
import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

const floatingStackStyle: CSSProperties = {
  position: "fixed",
  right: "16px",
  bottom: "16px",
  zIndex: 2200,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "10px",
};

const chatbotStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  textDecoration: "none",
  padding: "10px 14px 10px 10px",
  borderRadius: "999px",
  border: "1px solid rgba(255, 184, 205, 0.5)",
  background: "linear-gradient(135deg, rgba(18, 4, 9, 0.96), rgba(92, 12, 35, 0.96))",
  color: "#ffffff",
  boxShadow: "0 14px 28px rgba(18, 4, 9, 0.45)",
  backdropFilter: "blur(4px)",
};

const iconStyle: CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "999px",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(90deg, #8b0c2e 0%, #d82657 100%)",
  color: "#ffffff",
  flexShrink: 0,
};

const labelStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
  lineHeight: 1,
};

const scrollTopStyle: CSSProperties = {
  width: "44px",
  height: "44px",
  borderRadius: "999px",
  border: "1px solid rgba(255, 184, 205, 0.45)",
  background: "linear-gradient(135deg, rgba(15, 4, 8, 0.95), rgba(68, 11, 30, 0.95))",
  color: "#ffffff",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  boxShadow: "0 10px 22px rgba(15, 4, 8, 0.45)",
};

export default function FloatingAIAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 260);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/ai-assistant")) {
    return null;
  }

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenAssistant = (event: MouseEvent<HTMLAnchorElement>) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (user || token) return;

    event.preventDefault();
    toast.info("Please login to use the AI Diet Assistant.");
    router.push("/login");
  };

  return (
    <div style={floatingStackStyle}>
      {showScrollTop && (
        <button
          type="button"
          style={scrollTopStyle}
          className="floating-scroll-top-btn"
          onClick={handleScrollTop}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <FiChevronUp size={20} />
        </button>
      )}

      <Link
        href="/ai-assistant"
        className="floating-ai-chatbot-shell"
        style={chatbotStyle}
        onClick={handleOpenAssistant}
        aria-label="Open AI Diet Assistant"
        title="Start AI Diet Assistant"
      >
        <span className="floating-ai-chatbot-icon" style={iconStyle} aria-hidden="true">
          <FiMessageCircle size={20} />
        </span>
        <span className="floating-ai-chatbot-label" style={labelStyle}>AI Diet Assistant</span>
      </Link>
    </div>
  );
}
