"use client";
import { useEffect } from "react";

export default function StarCursor() {
  useEffect(() => {
    const createStar = (x: number, y: number) => {
      const star = document.createElement("div");
      star.className = "star";

      star.style.left = x + "px";
      star.style.top = y + "px";

      document.body.appendChild(star);

      setTimeout(() => {
        star.remove();
      }, 800);
    };

    const move = (e: MouseEvent) => {
      createStar(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
    };
  }, []);

  return null;
}