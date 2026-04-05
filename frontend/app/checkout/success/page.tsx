"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;

    const encodedSession = encodeURIComponent(sessionId);
    router.replace(`/payment/success?type=order&session_id=${encodedSession}`);
  }, [sessionId, router]);

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <h1>Redirecting to payment success</h1>
        <p>{sessionId ? "Please wait..." : "Missing session information."}</p>
        <Link href="/kitchen" className="checkout-link">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
