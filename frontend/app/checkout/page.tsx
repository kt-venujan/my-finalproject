"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { AxiosError } from "axios";
import api from "@/lib/axios";

type CartItem = {
  cartKey?: string;
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: "small" | "medium" | "large";
  bundleOfferId?: string;
  bundleOfferName?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [saveCard, setSaveCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError?.response?.data?.message || fallback;
  };

  useEffect(() => {
    const storedCart = localStorage.getItem("kitchenCart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem("kitchenCart");
      }
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("cancelled")) {
      setMessage("Payment cancelled. You can try again.");
    }
  }, [searchParams]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
    [cart]
  );

  const handlePay = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    setMessage("");

    try {
      const items = cart.map((item) => ({
        foodId: item._id,
        quantity: item.quantity,
        size: item.size,
        bundleOfferId: item.bundleOfferId,
      }));

      if (paymentMethod === "cash") {
        await api.post("/payments/orders/cash", { items });
        localStorage.removeItem("kitchenCart");
        setMessage("Order placed. Pay on delivery.");
        router.push("/kitchen");
        return;
      }

      const res = await api.post("/payments/stripe/create-checkout-session", {
        items,
        saveCard,
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Checkout failed"));
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-card">
          <h1>Checkout</h1>
          <p>Your cart is empty.</p>
          <Link href="/kitchen" className="checkout-link">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <Link href="/kitchen" className="checkout-link">
            Continue shopping
          </Link>
        </div>

        <div className="checkout-list">
          {cart.map((item) => (
            <div
              key={item.cartKey || `${item._id}-${item.bundleOfferId || "single"}-${item.size || "small"}`}
              className="checkout-row"
            >
              <div>
                <p className="checkout-name">{item.name}</p>
                <span className="checkout-meta">Qty {item.quantity}</span>
                {item.size && <span className="checkout-meta">Size {item.size}</span>}
                {item.bundleOfferName && (
                  <span className="checkout-meta">Bundle {item.bundleOfferName}</span>
                )}
              </div>
              <strong>Rs. {item.price * item.quantity}</strong>
            </div>
          ))}
        </div>

        <div className="checkout-total">
          <span>Total</span>
          <strong>Rs. {total}</strong>
        </div>

        <div className="checkout-payment">
          <label>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
            />
            Pay by card
          </label>
          <label>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "cash"}
              onChange={() => setPaymentMethod("cash")}
            />
            Cash on delivery
          </label>

          {paymentMethod === "card" && (
            <label className="checkout-save">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
              />
              Save card for future payments
            </label>
          )}
        </div>

        {message && <p className="checkout-message">{message}</p>}

        <button className="checkout-btn" onClick={handlePay} disabled={loading}>
          {loading ? "Processing..." : paymentMethod === "card" ? "Pay with card" : "Place order"}
        </button>
      </div>
    </div>
  );
}
