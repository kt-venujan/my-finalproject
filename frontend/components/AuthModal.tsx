"use client";

import { useEffect } from "react";
import AuthCard from "./AuthCard";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // 🔥 IMPORTANT
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[10000] p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-[30px] shadow-2xl w-[900px] max-w-full min-h-[550px] z-[10001] overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-5 right-6 text-3xl text-gray-500 hover:text-red-700 z-[10002] transition-colors" 
          onClick={onClose}
        >
          ×
        </button>

        <AuthCard />
      </div>
    </div>
  );
}