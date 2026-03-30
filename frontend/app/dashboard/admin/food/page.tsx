"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import AdminSidebar from "@/components/AdminSidebar";
import "../admin.css";

export default function FoodPage() {
  const [foods, setFoods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");

  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  const fetchFoods = async () => {
    const res = await api.get("/foods");
    setFoods(res.data);
  };

  const fetchCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data);
  };

  const addFood = async () => {
    
    await api.post("/admin/foods", {
      name,
      price: Number(price),
      category,
      image,
    });

    setName("");
    setPrice("");
    setCategory("");
    setImage("");

    fetchFoods();
  };

  const deleteFood = async (id: string) => {
    await api.delete(`/foods/${id}`);
    fetchFoods();
  };

  const addCategory = async () => {
        const token = localStorage.getItem("token");

    await api.post("/categories/create", {
      name: catName,
      image: catImage || "",
    }, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ MUST
        },
      });

    setCatName("");
    setCatImage("");

    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    await api.delete(`/categories/${id}`);
    fetchCategories();
  };

  return (
    <div className="layout">
      <AdminSidebar />

      <div className="main">
        <h2>Food Management 🍽️</h2>

        <div className="panel">
          <div className="food-row">

            {/* ADD CATEGORY */}
            <div>
              <h4>Add Category</h4>
              <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category Name" />
              <input value={catImage} onChange={(e) => setCatImage(e.target.value)} placeholder="/uploads/oats.jpg" />
              <button onClick={addCategory}>+ Add Category</button>
            </div>

            {/* ADD FOOD */}
            <div>
              <h4>Add Food</h4>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Food Name" />
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />

              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Select Category</option>
                {categories.map((c) => (
                  <option key={c._id}>{c.name}</option>
                ))}
              </select>

              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="/uploads/pizza.jpg" />
              <button onClick={addFood}>+ Add Food</button>
            </div>

          </div>

          {/* CATEGORY LIST */}
          <div className="food-grid">
            {categories.map((c) => (
              <div className="food-card" key={c._id}>
                <h4>{c.name}</h4>
                <button className="delete" onClick={() => deleteCategory(c._id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* FOOD LIST */}
          <div className="food-grid">
            {foods.map((f) => (
              <div className="food-card" key={f._id}>
                <h4>{f.name}</h4>
                <p>Rs. {f.price}</p>
                <span>{f.category}</span>

                <button onClick={() => deleteFood(f._id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}