"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import "./style.css";

export default function CategoryPage() {
  const params = useParams();
  const type = params?.type as string;

  const [foods, setFoods] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  // 🔥 FETCH FROM BACKEND
  useEffect(() => {
    if (!type) return;

    const fetchFoods = async () => {
      try {
        const res = await api.get(`/foods?category=${type}`);
        setFoods(res.data);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    fetchFoods();
  }, [type]);

  // ✅ ADD TO CART
  const addToCart = (item: any) => {
    setCart((prev) => {
      const exist = prev.find((i) => i._id === item._id);

      if (exist) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  };

  // ✅ INCREASE
  const increaseQty = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // ✅ DECREASE
  const decreaseQty = (id: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // ✅ REMOVE ITEM
  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  // ✅ CLEAR CART
  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="category-page">

      {/* LEFT SIDE */}
      <div className="main-content">

        <h1>{type?.toUpperCase()} Foods</h1>

        <div className="food-grid">
          {foods.length === 0 ? (
            <p>No foods available</p>
          ) : (
            foods.map((item: any) => (
              <div className="food-card" key={item._id}>
                <img src={item.image || "/default.jpg"} />
                <h3>{item.name}</h3>
                <p>Rs. {item.price}</p>

                <button
                  className="add-btn"
                  onClick={() => addToCart(item)}
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>

      </div>

      {/* RIGHT SIDE CART */}
      <div className="cart">

        <h2>My Order</h2>

        {cart.length === 0 && <p>No items</p>}

        {cart.map((item) => (
          <div key={item._id} className="cart-item">

            <div>
              <p>{item.name}</p>
              <small>Rs. {item.price}</small>
            </div>

            <div className="qty-box">
              <button onClick={() => decreaseQty(item._id)}>-</button>
              <span>{item.qty}</span>
              <button onClick={() => increaseQty(item._id)}>+</button>
            </div>

            <button
              className="remove-btn"
              onClick={() => removeItem(item._id)}
            >
              ❌
            </button>

          </div>
        ))}

        <h3>Total: Rs. {total}</h3>

        {cart.length > 0 && (
          <>
            <button className="clear-btn" onClick={clearCart}>
              Clear Cart
            </button>

            <button
              className="checkout-btn"
              onClick={() => alert("Proceed to Checkout")}
            >
              Checkout
            </button>
          </>
        )}

      </div>

    </div>
  );
}