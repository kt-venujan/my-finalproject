"use client";

import "./kitchen.css";
import { Cinzel_Decorative } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

const font = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function KitchenPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  // ✅ FETCH
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  // ✅ SCROLL
  const scrollToMenu = () => {
    const el = document.getElementById("menu-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="overlay">
          <div className="swirl">~ ~ ~</div>

          <h1 className={`title ${font.className}`}>
            DIETARA <br /> KITCHEN
          </h1>

          <button className="hero-btn" onClick={scrollToMenu}>
            Start Your Plan
          </button>
        </div>
      </section>

      {/* CATEGORY */}
      <section id="menu-section" className="menu-page">
        <h1>Choose Category</h1>

        <div className="grid">
          {categories.map((cat) => (
            <div className="card" key={cat._id}>

              {/* ✅ IMAGE */}
              <img
                src={`http://localhost:5000${
                  cat.image || "/uploads/default.jpg"
                }`}
                alt={cat.name}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
              />

              <h2>{cat.name}</h2>

              {/* ✅ SAFE ROUTE */}
              <button
                onClick={() =>
                  router.push(
                    `/kitchen/category/${cat.name.toLowerCase()}`
                  )
                }
              >
                Show Foods
              </button>

            </div>
          ))}
        </div>
      </section>
    </div>
  );
}