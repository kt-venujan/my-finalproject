"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [foods, setFoods] = useState<any[]>([]);

  // 🔥 FETCH FOODS
  const fetchFoods = async () => {
    const res = await api.get("/foods");
    setFoods(res.data);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // 🔥 ADD FOOD
  const addFood = async () => {
    await api.post("/admin/foods", {
      name,
      calories,
    });

    alert("Food Added ✅");
    fetchFoods();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <h2>Add Food</h2>

      <input
        placeholder="Food name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />

      <input
        placeholder="Calories"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
      />
      <br />

      <button onClick={addFood}>Add Food</button>

      <hr />

      <h2>All Foods</h2>

      {foods.map((f) => (
        <div key={f._id}>
          {f.name} - {f.calories} cal
        </div>
      ))}
    </div>
  );
}