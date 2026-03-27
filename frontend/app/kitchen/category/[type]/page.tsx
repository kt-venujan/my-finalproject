"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import "./style.css";

export default function CategoryPage() {
  const params = useParams();
  const type = (params?.type as string) || "oats";

  const [cart, setCart] = useState<any[]>([]);

  const foodData: any = {
    oats: [
      { name: "Oats Pittu", price: 500, img: "/oats-pittu.jpg" },
      { name: "Oats Smoothie", price: 350, img: "/oatssmoothie.jpg" },
      { name: "Oats Salad", price: 400, img: "/oatssalad.jpg" },
      { name: "Oats Porridge", price: 450, img: "/oatspridge.jpg" },
      { name: "Oats Idli", price: 300, img: "/oatsidli.jpg" },
      { name: "Oats Dosa", price: 350, img: "/oatsdosa.jpg" },
      { name: "Oats Upma", price: 400, img: "/oatsupma.jpg" },
      { name: "Oats Pancakes", price: 450, img: "/oatspancakes.jpg" },
      { name: "Oats Energy Balls", price: 300, img: "/oatsenergyballs.jpg" },
      { name: "Oats Muffins", price: 400, img: "/oatsmuffins.jpg" },
    ],
  };

  const foods = foodData[type] || [];

  // ✅ ADD TO CART
  const addToCart = (item: any) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.name === item.name);

      if (exist) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  };

  // ✅ INCREASE
  const increaseQty = (name: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // ✅ DECREASE
  const decreaseQty = (name: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.name === name ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // ✅ REMOVE ITEM
  const removeItem = (name: string) => {
    setCart((prev) => prev.filter((item) => item.name !== name));
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

        <h1>{type.toUpperCase()} Foods</h1>

        <div className="food-grid">
          {foods.map((item: any, i: number) => (
            <div className="food-card" key={i}>
              <img src={item.img} />
              <h3>{item.name}</h3>
              <p>Rs. {item.price}</p>

              <button
                className="add-btn"
                onClick={() => addToCart(item)}
              >
                Add
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT SIDE CART */}
      <div className="cart">

        <h2>My Order</h2>

        {cart.length === 0 && <p>No items</p>}

        {cart.map((item, i) => (
          <div key={i} className="cart-item">

            <div>
              <p>{item.name}</p>
              <small>Rs. {item.price}</small>
            </div>

            <div className="qty-box">
              <button onClick={() => decreaseQty(item.name)}>-</button>
              <span>{item.qty}</span>
              <button onClick={() => increaseQty(item.name)}>+</button>
            </div>

            {/* ❌ REMOVE BUTTON */}
            <button
              className="remove-btn"
              onClick={() => removeItem(item.name)}
            >
              ❌
            </button>

          </div>
        ))}

        {/* TOTAL */}
        <h3>Total: Rs. {total}</h3>

        {/* ACTIONS */}
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