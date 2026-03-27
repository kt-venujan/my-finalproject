"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function UserDashboard() {
  const [foods, setFoods] = useState<any[]>([]);

  const fetchFoods = async () => {
    const res = await api.get("/foods");
    setFoods(res.data);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>User Dashboard</h1>

      <h2>Available Foods</h2>

      {foods.map((f) => (
        <div key={f._id}>
          🍽️ {f.name} - {f.calories} cal
        </div>
      ))}
    </div>
  );
}