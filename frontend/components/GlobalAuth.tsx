"use client";

import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

export default function GlobalAuth() {
  const { isLoginOpen, closeLogin } = useAuth();
  
  return <AuthModal isOpen={isLoginOpen} onClose={closeLogin} />;
}
