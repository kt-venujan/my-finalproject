"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { AxiosError } from "axios";
import api from "@/lib/axios";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [message, setMessage] = useState(
    sessionId ? "Confirming payment..." : "Missing session information."
  );

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError?.response?.data?.message || fallback;
  };

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const confirm = async () => {
      try {
        await api.get(`/payments/stripe/confirm?sessionId=${sessionId}`);
        localStorage.removeItem("kitchenCart");
        setMessage("Payment successful. Your order is confirmed.");
      } catch (error) {
        setMessage(getApiErrorMessage(error, "Payment confirmation failed"));
      }
    };

    confirm();
  }, [sessionId]);

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <h1>Checkout Complete</h1>
        <p>{message}</p>
        <Link href="/kitchen" className="checkout-link">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
