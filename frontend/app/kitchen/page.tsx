"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiGrid, FiShoppingCart } from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import api from "@/lib/axios";

type PlanType = "weekly" | "monthly";
type SizeType = "small" | "medium" | "large";

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

interface BundleOfferItem {
  food: Food;
  defaultQty: number;
  minQty: number;
  maxQty: number;
  allowedSizes: SizeType[];
}

interface BundleOffer {
  _id: string;
  name: string;
  description: string;
  planType: PlanType;
  discountPercent: number;
  isActive: boolean;
  items: BundleOfferItem[];
}

interface CartItem extends Food {
  quantity: number;
  categoryName?: string;
  size?: SizeType;
  bundleOfferId?: string;
  bundleOfferName?: string;
  discountPercent?: number;
  cartKey: string;
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
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [planType, setPlanType] = useState<PlanType>("weekly");
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const [bundleOffersByPlan, setBundleOffersByPlan] = useState<
    Record<PlanType, BundleOffer[]>
  >({
    weekly: [],
    monthly: [],
  });
  const [bundleModalOpen, setBundleModalOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<BundleOffer | null>(null);
  const [bundleSelection, setBundleSelection] = useState<
    Record<string, { quantity: number; size: SizeType }>
  >({});
  const [isClient, setIsClient] = useState(false);

  const [foodsModalOpen, setFoodsModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);

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
    const storedCart = localStorage.getItem("kitchenCart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart) as CartItem[];
        setCart(
          parsed.map((item) => ({
            ...item,
            cartKey:
              item.cartKey ||
              `${item._id}::${item.bundleOfferId || "single"}::${item.size || "small"}`,
          }))
        );
      } catch {
        localStorage.removeItem("kitchenCart");
      }
    }
  }, []);

  useEffect(() => {
    const fetchBundleOffers = async () => {
      try {
        const [weeklyRes, monthlyRes] = await Promise.all([
          api.get("/bundle-offers?planType=weekly"),
          api.get("/bundle-offers?planType=monthly"),
        ]);

        setBundleOffersByPlan({
          weekly: weeklyRes.data || [],
          monthly: monthlyRes.data || [],
        });
      } catch (error) {
        console.error("Failed to fetch bundle offers", error);
        setBundleOffersByPlan({ weekly: [], monthly: [] });
      }
    };

    fetchBundleOffers();
  }, []);

  useEffect(() => {
    localStorage.setItem("kitchenCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMealIndex((prev) => (prev + 1) % featuredMeals.length);
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  const openFoodsModal = async (category: Category) => {
    try {
      setSelectedCategory(category);
      setFoodsModalOpen(true);
      setLoadingFoods(true);

      const res = await api.get(
        `/foods?category=${encodeURIComponent(category.name)}`
      );

      setFoods(res.data || []);
    } catch (error) {
      console.error("Failed to fetch foods", error);
      setFoods([]);
    } finally {
      setLoadingFoods(false);
    }
  };

  const closeFoodsModal = () => {
    setFoodsModalOpen(false);
    setSelectedCategory(null);
    setFoods([]);
  };

  const toggleCartModal = () => {
    setCartModalOpen((prev) => !prev);
  };

  const getCartKey = (foodId: string, size: SizeType, bundleOfferId?: string) => {
    return `${foodId}::${bundleOfferId || "single"}::${size}`;
  };

  const sizeMultiplier: Record<SizeType, number> = {
    small: 1,
    medium: 1.25,
    large: 1.5,
  };

  const addToCart = (food: Food) => {
    const cartKey = getCartKey(food._id, "small");
    setCart((prev) => {
      const existing = prev.find((item) => item.cartKey === cartKey);

      if (existing) {
        return prev.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          ...food,
          cartKey,
          quantity: 1,
          size: "small",
          categoryName: selectedCategory?.name || "",
        },
      ];
    });
  };

  const increaseQty = (cartKey: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (cartKey: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (cartKey: string) => {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const openBundleModal = (offer: BundleOffer) => {
    const nextSelection: Record<string, { quantity: number; size: SizeType }> = {};

    offer.items.forEach((item) => {
      if (!item.food?._id) return;

      nextSelection[item.food._id] = {
        quantity: Math.max(0, Number(item.defaultQty ?? 1)),
        size: (item.allowedSizes?.[0] || "small") as SizeType,
      };
    });

    setSelectedBundle(offer);
    setBundleSelection(nextSelection);
    setBundleModalOpen(true);
  };

  const addBundleToCart = () => {
    if (!selectedBundle) return;

    setCart((prev) => {
      let next = [...prev];

      selectedBundle.items.forEach((rule) => {
        const food = rule.food;
        if (!food?._id) return;

        const selected = bundleSelection[food._id];
        if (!selected) return;

        const quantity = Number(selected.quantity || 0);
        if (quantity <= 0) return;

        const size = selected.size || "small";
        const multiplier = sizeMultiplier[size] || 1;
        const discountedPrice = Number(
          (
            Number(food.price || 0) *
            multiplier *
            (1 - Number(selectedBundle.discountPercent || 0) / 100)
          ).toFixed(2)
        );

        const cartKey = getCartKey(food._id, size, selectedBundle._id);
        const existing = next.find((item) => item.cartKey === cartKey);

        if (existing) {
          next = next.map((item) =>
            item.cartKey === cartKey
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          next.push({
            ...food,
            name: `${food.name} (${size})`,
            price: discountedPrice,
            quantity,
            size,
            bundleOfferId: selectedBundle._id,
            bundleOfferName: selectedBundle.name,
            discountPercent: selectedBundle.discountPercent,
            categoryName: food.category || "Bundle",
            cartKey,
          });
        }
      });

      return next;
    });

    setBundleModalOpen(false);
    setSelectedBundle(null);
  };

  const clearCart = () => {
    setCart([]);
  };

  const getImageUrl = (path?: string) => {
    if (!path) return "/hero-food.jpg";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  const totalCartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    [cart]
  );

  const activeMeal = featuredMeals[activeMealIndex];
  const showKitchenFloatingCart = pathname.startsWith("/kitchen");
  const floatingCartNode =
    isClient && showKitchenFloatingCart
      ? createPortal(
          <button
            className={`floating-cart-btn kitchen-floating-cart-btn ${cartModalOpen ? "is-open" : ""}`}
            type="button"
            onClick={toggleCartModal}
            aria-label={`Open cart with ${totalCartCount} items, total Rs. ${totalAmount}`}
            title={cartModalOpen ? "Close cart" : "Open cart"}
          >
            <FiShoppingCart size={20} />
          </button>,
          document.body
        )
      : null;

  const cartModalNode =
    isClient && cartModalOpen
      ? createPortal(
          <div
            className="modal-overlay kitchen-modal-overlay"
            onClick={() => setCartModalOpen(false)}
          >
            <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>My Cart</h3>
                  <p>
                    {totalCartCount} item{totalCartCount === 1 ? "" : "s"} added
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() => setCartModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="modal-empty">Your cart is empty.</div>
              ) : (
                <>
                  <div className="cart-modal-list">
                    {cart.map((item) => (
                      <div key={item.cartKey} className="cart-modal-row">
                        <div className="cart-modal-row__left">
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
                            <p>{item.categoryName || "Category"}</p>
                            {item.bundleOfferName && (
                              <p>
                                Bundle: {item.bundleOfferName} ({item.discountPercent || 0}% off)
                              </p>
                            )}
                            <span>Rs. {item.price ?? 0}</span>
                          </div>
                        </div>

                        <div className="cart-modal-row__right">
                          <div className="qty-box">
                            <button onClick={() => decreaseQty(item.cartKey)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => increaseQty(item.cartKey)}>+</button>
                          </div>

                          <strong>Rs. {(item.price ?? 0) * item.quantity}</strong>

                          <button
                            className="remove-btn"
                            onClick={() => removeItem(item.cartKey)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-modal-footer">
                    <div className="cart-summary">
                      <div>
                        <span>Total Items</span>
                        <strong>{totalCartCount}</strong>
                      </div>

                      <div>
                        <span>Total Amount</span>
                        <strong>Rs. {totalAmount}</strong>
                      </div>
                    </div>

                    <div className="cart-footer-actions">
                      <button
                        className="ghost-cart-btn"
                        onClick={() => setCartModalOpen(false)}
                      >
                        Continue Shopping
                      </button>

                      <button className="clear-cart-btn" onClick={clearCart}>
                        Clear Cart
                      </button>

                      <button
                        className="checkout-btn"
                        onClick={() => {
                          setCartModalOpen(false);
                          router.push("/checkout");
                        }}
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  const foodsModalNode =
    isClient && foodsModalOpen
      ? createPortal(
          <div className="modal-overlay kitchen-modal-overlay" onClick={closeFoodsModal}>
            <div className="foods-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>{selectedCategory?.name || "Foods"}</h3>
                  <p>
                    {planType === "weekly" ? "Weekly Plan" : "Monthly Plan"} foods
                  </p>
                </div>

                <button className="modal-close" onClick={closeFoodsModal}>
                  ✕
                </button>
              </div>

              {loadingFoods ? (
                <div className="modal-empty">Loading foods...</div>
              ) : foods.length === 0 ? (
                <div className="modal-empty">No foods found for this category.</div>
              ) : (
                <div className="foods-grid-v2">
                  {foods.map((food) => (
                    <div key={food._id} className="food-card-v2">
                      <div className="food-card-v2__image">
                        <img
                          src={getImageUrl(food.image)}
                          alt={food.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/hero-food.jpg";
                          }}
                        />
                      </div>

                      <div className="food-card-v2__body">
                        <h4>{food.name}</h4>

                        <div className="food-card-v2__meta">
                          <span>{food.calories ?? 0} kcal</span>
                          <strong>Rs. {food.price ?? 0}</strong>
                        </div>

                        <div className="food-card-v2__nutrition">
                          <span>P: {food.protein ?? 0}g</span>
                          <span>C: {food.carbs ?? 0}g</span>
                          <span>F: {food.fat ?? 0}g</span>
                        </div>

                        <button
                          className="food-card-v2__btn"
                          onClick={() => addToCart(food)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  const bundleModalNode =
    isClient && bundleModalOpen && selectedBundle
      ? createPortal(
          <div className="modal-overlay kitchen-modal-overlay" onClick={() => setBundleModalOpen(false)}>
            <div className="foods-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>{selectedBundle.name}</h3>
                  <p>{selectedBundle.discountPercent}% discount for {selectedBundle.planType} plan</p>
                </div>
                <button className="modal-close" onClick={() => setBundleModalOpen(false)}>
                  ✕
                </button>
              </div>

              <div className="bundle-customize-list">
                {selectedBundle.items.map((rule) => {
                  const food = rule.food;
                  if (!food?._id) return null;

                  const selected = bundleSelection[food._id] || {
                    quantity: rule.defaultQty || 1,
                    size: (rule.allowedSizes?.[0] || "small") as SizeType,
                  };

                  return (
                    <div key={food._id} className="bundle-custom-row">
                      <div className="bundle-custom-food">
                        <img
                          src={getImageUrl(food.image)}
                          alt={food.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/hero-food.jpg";
                          }}
                        />
                        <div>
                          <h4>{food.name}</h4>
                          <p>Base Rs. {food.price ?? 0}</p>
                          <p>
                            Qty range {rule.minQty} - {rule.maxQty}
                          </p>
                        </div>
                      </div>

                      <div className="bundle-custom-controls">
                        <input
                          type="number"
                          min={rule.minQty}
                          max={rule.maxQty}
                          value={selected.quantity}
                          onChange={(e) =>
                            setBundleSelection((prev) => ({
                              ...prev,
                              [food._id]: {
                                ...selected,
                                quantity: Number(e.target.value || 0),
                              },
                            }))
                          }
                        />

                        <select
                          value={selected.size}
                          onChange={(e) =>
                            setBundleSelection((prev) => ({
                              ...prev,
                              [food._id]: {
                                ...selected,
                                size: e.target.value as SizeType,
                              },
                            }))
                          }
                        >
                          {rule.allowedSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bundle-custom-footer">
                <button className="ghost-cart-btn" onClick={() => setBundleModalOpen(false)}>
                  Cancel
                </button>
                <button className="checkout-btn" onClick={addBundleToCart}>
                  Add Bundle to Cart
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
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

        <section className="category-section-v2">
          <div className="section-head-v2">
            <h2>Choose Category</h2>
            <p>
              Click a category and view foods in a popup. You can add items from
              multiple categories into the same cart.
            </p>
          </div>

          <div className="category-grid-v2">
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                className="category-card-v2"
                onClick={() => openFoodsModal(category)}
                aria-label={`Open ${category.name} foods`}
              >
                <div className="category-card-v2__top">
                  <span className="category-card-v2__icon">
                    <FiGrid />
                  </span>
                  <h3>{category.name}</h3>
                </div>

                <p>Open this category and view more foods.</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 pb-20">
          <div className="mb-8 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#fff7ef]">Bundle Offers</h2>
            <p className="mx-auto mt-3 max-w-3xl text-base text-white/75">
              Choose weekly or monthly bundles, customize food count and size, and get admin-managed discounts.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
            {(["weekly", "monthly"] as PlanType[]).map((plan) => {
              const offers = bundleOffersByPlan[plan] || [];
              const planLabel = plan === "weekly" ? "Weekly Plans" : "Monthly Plans";

              return (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5" key={plan}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-2xl font-semibold text-[#fff7ef]">{planLabel}</h3>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-[#efe8f0]">
                      {offers.length} offers
                    </span>
                  </div>

                  {offers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/25 px-5 py-8 text-center text-white/70">
                      No active {plan} bundles right now.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {offers.map((offer) => (
                        <article
                          key={offer._id}
                          className="cursor-pointer rounded-2xl border border-white/10 bg-[#250914]/90 p-5 shadow-[0_16px_30px_rgba(0,0,0,0.2)] transition hover:border-[#a90f3e]/60"
                          role="button"
                          tabIndex={0}
                          onClick={() => openBundleModal(offer)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openBundleModal(offer);
                            }
                          }}
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <h3 className="min-w-0 text-3xl font-semibold leading-tight text-white break-words">
                              {offer.name}
                            </h3>
                            <span className="shrink-0 rounded-full bg-[#a90f3e]/35 px-3 py-1 text-xs font-bold text-[#ffe2ec]">
                              {offer.discountPercent}% OFF
                            </span>
                          </div>

                          <p className="text-base text-white/80">
                            {offer.description || "Build your custom meal mix."}
                          </p>
                          <p className="mt-2 text-sm text-white/75">{offer.items.length} foods included</p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {floatingCartNode}

        {foodsModalNode}

        {cartModalNode}

        {bundleModalNode}
      </main>
    </>
  );
}