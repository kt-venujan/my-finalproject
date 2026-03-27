"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function AdminDashboard() {
  const [foods, setFoods] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const fetchFoods = async () => {
    const res = await api.get("/foods");
    setFoods(res.data);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const addFood = async () => {
    if (!name || !price) return alert("Fill all fields");

    await api.post("/admin/foods", { name, price, category });

    setName("");
    setPrice("");
    setCategory("");
    fetchFoods();
  };

  const deleteFood = async (id: string) => {
    await api.delete(`/admin/foods/${id}`);
    fetchFoods();
  };

  return (
    <div className="admin-page">
      <h1 className="admin-title">Admin Dashboard 🔥</h1>

      {/* ADD FOOD CARD */}
      <div className="card">
        <h2>Add Food</h2>

        <input
          placeholder="Food Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button onClick={addFood}>Add Food</button>
      </div>

      {/* FOOD LIST */}
      <div className="food-grid">
        {foods.map((f) => (
          <div className="food-card" key={f._id}>
            <h3>{f.name}</h3>
            <p>Rs.{f.price}</p>
            <span>{f.category || "No category"}</span>

            <button onClick={() => deleteFood(f._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}