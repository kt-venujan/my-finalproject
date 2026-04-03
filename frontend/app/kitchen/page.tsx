"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/axios";

type PlanType = "weekly" | "monthly";

interface Category {
  _id: string;
  name: string;
  image?: string;
}

interface Food {
  _id: string;
  name: string;
  image?: string;
  calories?: number;
  price?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface CartItem extends Food {
  quantity: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const featuredMeals = [
  {
    title: "Healthy Featured Meal",
    subtitle: "WEEKLY PLAN",
    description:
      "Fresh meals designed for your routine with balanced nutrition and a clean food experience.",
    tags: ["Fresh", "Healthy", "Ready"],
    image: "/hero-food.png",
    glow: "orange",
    bg: "theme-orange",
  },
  {
    title: "Protein Power Bowl",
    subtitle: "MONTHLY PLAN",
    description:
      "High-protein meals crafted for strength, energy, and a more consistent healthy eating routine.",
    tags: ["Protein", "Balanced", "Strong"],
    image: "/hero-food-2.png",
    glow: "green",
    bg: "theme-green",
  },
  {
    title: "Clean Veg Delight",
    subtitle: "WEEKLY PLAN",
    description:
      "Light and colorful vegetable-based meals with smart portions and refreshing ingredients.",
    tags: ["Veg", "Light", "Clean"],
    image: "/hero-food-3.png",
    glow: "pink",
    bg: "theme-pink",
  },
];

export default function KitchenPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [planType, setPlanType] = useState<PlanType>("weekly");
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeMealIndex, setActiveMealIndex] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMealIndex((prev) => (prev + 1) % featuredMeals.length);
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  const loadFoods = async (categoryName: string) => {
    try {
      setSelectedCategory(categoryName);
      setLoadingFoods(true);

      const res = await api.get(
        `/foods?category=${encodeURIComponent(categoryName)}`
      );

      setFoods(res.data || []);

      document
        .getElementById("foods-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error("Failed to fetch foods", error);
      setFoods([]);
    } finally {
      setLoadingFoods(false);
    }
  };

  const addToCart = (food: Food) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === food._id);

      if (existing) {
        return prev.map((item) =>
          item._id === food._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...food, quantity: 1 }];
    });
  };

  const getImageUrl = (path?: string) => {
    if (!path) return "/hero-food.jpg";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeMeal = featuredMeals[activeMealIndex];

  return (
    <>
      <Navbar />

      <main className="kitchen-page">
        <section className={`cinematic-hero ${activeMeal.bg}`}>
          <div className="hero-noise" />
          <div className="hero-radial hero-radial-left" />
          <div className="hero-radial hero-radial-right" />

          <div className="cinematic-shell">
            <motion.div
              className="cinematic-grid"
              initial="hidden"
              animate="show"
            >
              <div className="hero-copy">
                <motion.span
                  className="hero-chip"
                  custom={0.1}
                  variants={fadeUp}
                >
                  Dietara Kitchen
                </motion.span>

                <motion.h1
                  className="cinematic-title"
                  custom={0.2}
                  variants={fadeUp}
                >
                  Book Your Healthy Meals by Category
                </motion.h1>

                <motion.p
                  className="cinematic-text"
                  custom={0.35}
                  variants={fadeUp}
                >
                  Choose your weekly or monthly plan, explore categories, and
                  add healthy meals to your cart with a smooth and simple flow.
                </motion.p>

                <motion.div
                  className="cinematic-actions"
                  custom={0.5}
                  variants={fadeUp}
                >
                  <button
                    className={
                      planType === "weekly"
                        ? "cinematic-btn primary active"
                        : "cinematic-btn primary"
                    }
                    onClick={() => setPlanType("weekly")}
                  >
                    Start Weekly Plan
                  </button>

                  <button
                    className={
                      planType === "monthly"
                        ? "cinematic-btn secondary active"
                        : "cinematic-btn secondary"
                    }
                    onClick={() => setPlanType("monthly")}
                  >
                    Start Monthly Plan
                  </button>
                </motion.div>
              </div>

              <div className="hero-center-visual">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMeal.image}
                    className="hero-visual-inner"
                    initial={{ opacity: 0, scale: 0.82, y: 30, rotate: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.08, y: -18, rotate: 4 }}
                    transition={{
                      duration: 0.85,
                      ease: [0.22, 1, 0.36, 1] as const,
                    }}
                  >
                    <motion.div
                      className={`hero-center-glow ${activeMeal.glow}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.15 }}
                      transition={{ duration: 0.7 }}
                    />

                    <motion.img
                      src={activeMeal.image}
                      alt={activeMeal.title}
                      className="hero-main-food"
                      initial={{ opacity: 0, scale: 0.9, y: 24 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.06, y: -20 }}
                      transition={{
                        duration: 0.85,
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/hero-food.jpg";
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="hero-feature-card-wrap">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMeal.title}
                    className="hero-feature-card"
                    initial={{
                      opacity: 0,
                      x: 40,
                      scale: 0.96,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      x: -24,
                      scale: 0.98,
                      filter: "blur(8px)",
                    }}
                    transition={{
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1] as const,
                    }}
                  >
                    <span className="feature-kicker">{activeMeal.subtitle}</span>

                    <h3>{activeMeal.title}</h3>

                    <p>{activeMeal.description}</p>

                    <div className="feature-tags">
                      {activeMeal.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>

                    <div className="feature-bottom">
                      <span>
                        {planType === "weekly" ? "Weekly Plan" : "Monthly Plan"}
                      </span>
                      <strong>{totalCartCount} Items in Cart</strong>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="category-section">
          <div className="section-head">
            <h2>Choose Category</h2>
            <p>
              Select a category to view foods and add them to your{" "}
              {planType === "weekly" ? "weekly" : "monthly"} plan.
            </p>
          </div>

          <div className="category-grid">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className={
                  selectedCategory === cat.name
                    ? "category-card selected"
                    : "category-card"
                }
              >
                <div className="category-image">
                  <img
                    src={getImageUrl(cat.image)}
                    alt={cat.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/hero-food.jpg";
                    }}
                  />
                </div>

                <div className="category-info">
                  <h3>{cat.name}</h3>
                  <p>Browse meals under this category</p>
                  <button className="view-btn" onClick={() => loadFoods(cat.name)}>
                    View Meals
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="foods-section" className="foods-section">
          <div className="section-head">
            <h2>
              {selectedCategory
                ? `${selectedCategory} Meals`
                : "Select a Category to View Foods"}
            </h2>
            <p>
              Add meals to your{" "}
              {planType === "weekly" ? "weekly" : "monthly"} cart.
            </p>
          </div>

          {loadingFoods ? (
            <div className="empty-state">Loading foods...</div>
          ) : selectedCategory && foods.length === 0 ? (
            <div className="empty-state">No foods found for this category.</div>
          ) : !selectedCategory ? (
            <div className="empty-state">
              Please choose a category above to view foods.
            </div>
          ) : (
            <div className="food-grid">
              {foods.map((food) => (
                <div key={food._id} className="food-card">
                  <div className="food-image">
                    <img
                      src={getImageUrl(food.image)}
                      alt={food.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/food-2.png";
                      }}
                    />
                  </div>

                  <div className="food-body">
                    <div className="food-top">
                      <h3>{food.name}</h3>
                      <span className="food-tag">
                        {planType === "weekly" ? "Weekly" : "Monthly"}
                      </span>
                    </div>

                    <div className="food-meta">
                      <span>{food.calories ?? 0} kcal</span>
                      <span>Rs. {food.price ?? 0}</span>
                    </div>

                    <div className="food-nutrition">
                      <span>P: {food.protein ?? 0}g</span>
                      <span>C: {food.carbs ?? 0}g</span>
                      <span>F: {food.fat ?? 0}g</span>
                    </div>

                    <button className="add-cart-btn" onClick={() => addToCart(food)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="cart-preview-section">
          <div className="section-head">
            <h2>My Cart</h2>
            <p>Your selected meals for the current plan.</p>
          </div>

          {cart.length === 0 ? (
            <div className="empty-state">No items added yet.</div>
          ) : (
            <div className="cart-list">
              {cart.map((item) => (
                <div key={item._id} className="cart-row">
                  <div className="cart-row-left">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/hero-food.jpg";
                      }}
                    />
                    <div>
                      <h4>{item.name}</h4>
                      <p>
                        {planType === "weekly" ? "Weekly Plan" : "Monthly Plan"}
                      </p>
                    </div>
                  </div>

                  <div className="cart-row-right">
                    <span>Qty: {item.quantity}</span>
                    <strong>Rs. {(item.price ?? 0) * item.quantity}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}