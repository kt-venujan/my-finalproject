"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function UserDashboard() {
  const [foods, setFoods] = useState<any[]>([]);

  // 🔥 FETCH FROM BACKEND
  const fetchFoods = async () => {
    try {
      const res = await api.get("/foods");
      setFoods(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>User Dashboard 🍽️</h1>

      <h2>Available Foods</h2>

      {foods.length === 0 ? (
        <p>No foods available</p>
      ) : (
        foods.map((f) => (
          <div key={f._id}>
            🍽️ {f.name} - Rs.{f.price}
          </div>
        ))
      )}
    </div>
  );
}