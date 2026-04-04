"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { FiGift, FiPlus, FiTrash2 } from "react-icons/fi";

type PlanType = "weekly" | "monthly";
type SizeType = "small" | "medium" | "large";

type Food = {
  _id: string;
  name: string;
  price: number;
  category?: string;
};

type BundleItem = {
  food?: { _id: string; name: string; price: number; category?: string };
  foodId?: string;
  defaultQty: number;
  minQty: number;
  maxQty: number;
  allowedSizes: SizeType[];
};

type BundleOffer = {
  _id: string;
  name: string;
  description: string;
  planType: PlanType;
  discountPercent: number;
  isActive: boolean;
  items: BundleItem[];
};

const DEFAULT_ITEM: BundleItem = {
  foodId: "",
  defaultQty: 1,
  minQty: 0,
  maxQty: 20,
  allowedSizes: ["small", "medium", "large"],
};

export default function BundleOfferPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [offers, setOffers] = useState<BundleOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [planType, setPlanType] = useState<PlanType>("weekly");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState<BundleItem[]>([{ ...DEFAULT_ITEM }]);

  const groupedFoods = useMemo(() => {
    return foods.reduce<Record<string, Food[]>>((acc, food) => {
      const key = food.category || "Uncategorized";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(food);
      return acc;
    }, {});
  }, [foods]);

  const fetchFoods = async () => {
    const res = await api.get("/foods");
    setFoods(res.data || []);
  };

  const fetchOffers = async () => {
    const res = await api.get("/bundle-offers/admin");
    setOffers(res.data || []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchFoods(), fetchOffers()]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPlanType("weekly");
    setDiscountPercent("10");
    setIsActive(true);
    setItems([{ ...DEFAULT_ITEM }]);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const payload = {
      name,
      description,
      planType,
      discountPercent: Number(discountPercent || 0),
      isActive,
      items: items
        .filter((item) => item.foodId)
        .map((item) => ({
          foodId: item.foodId,
          defaultQty: Number(item.defaultQty || 1),
          minQty: Number(item.minQty || 0),
          maxQty: Number(item.maxQty || 20),
          allowedSizes: item.allowedSizes,
        })),
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/bundle-offers/admin/${editingId}`, payload);
      } else {
        await api.post("/bundle-offers/admin", payload);
      }

      await fetchOffers();
      resetForm();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (offer: BundleOffer) => {
    setEditingId(offer._id);
    setName(offer.name || "");
    setDescription(offer.description || "");
    setPlanType(offer.planType || "weekly");
    setDiscountPercent(String(offer.discountPercent ?? 0));
    setIsActive(Boolean(offer.isActive));
    setItems(
      (offer.items || []).map((item) => ({
        foodId: item.food?._id || item.foodId || "",
        defaultQty: Number(item.defaultQty ?? 1),
        minQty: Number(item.minQty ?? 0),
        maxQty: Number(item.maxQty ?? 20),
        allowedSizes:
          item.allowedSizes && item.allowedSizes.length > 0
            ? item.allowedSizes
            : ["small", "medium", "large"],
      }))
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/bundle-offers/admin/${id}`);
      await fetchOffers();
      if (editingId === id) resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const updateItem = (index: number, next: Partial<BundleItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...next } : item)));
  };

  const toggleSize = (index: number, size: SizeType) => {
    const current = items[index]?.allowedSizes || [];
    const has = current.includes(size);
    const next = has ? current.filter((s) => s !== size) : [...current, size];
    updateItem(index, { allowedSizes: next.length ? next : ["small"] });
  };

  return (
    <section className="adm-section">
      <div className="adm-page-head">
        <h1 className="adm-title">Bundle Offers</h1>
        <p>Create weekly/monthly customizable bundles and manage discount percentages.</p>
      </div>

      <div className="adm-panel">
        <h3 className="adm-subtitle">
          <FiGift />
          {editingId ? "Edit Bundle Offer" : "Create Bundle Offer"}
        </h3>

        <div className="adm-bundle-grid">
          <input
            className="adm-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Offer name"
          />

          <select className="adm-select" value={planType} onChange={(e) => setPlanType(e.target.value as PlanType)}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <input
            className="adm-input"
            type="number"
            min={0}
            max={90}
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            placeholder="Discount %"
          />

          <label className="adm-bundle-toggle">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
        </div>

        <textarea
          className="adm-input adm-bundle-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={3}
        />

        <div className="adm-bundle-items">
          <div className="adm-action-row">
            <button
              className="adm-btn ghost"
              onClick={() => setItems((prev) => [...prev, { ...DEFAULT_ITEM }])}
              type="button"
            >
              <FiPlus />
              Add Food Rule
            </button>
          </div>

          {items.map((item, index) => (
            <div className="adm-bundle-item" key={`${item.foodId}-${index}`}>
              <div className="adm-bundle-item-head">
                <strong>Rule {index + 1}</strong>
                <button
                  className="adm-btn danger"
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  disabled={items.length === 1}
                >
                  <FiTrash2 />
                  Remove
                </button>
              </div>

              <select
                className="adm-select"
                value={item.foodId || ""}
                onChange={(e) => updateItem(index, { foodId: e.target.value })}
              >
                <option value="">Select food</option>
                {Object.entries(groupedFoods).map(([categoryName, list]) => (
                  <optgroup key={categoryName} label={categoryName}>
                    {list.map((food) => (
                      <option key={food._id} value={food._id}>
                        {food.name} - Rs. {food.price}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <div className="adm-bundle-grid compact">
                <input
                  className="adm-input"
                  type="number"
                  min={0}
                  value={item.minQty}
                  onChange={(e) => updateItem(index, { minQty: Number(e.target.value) })}
                  placeholder="Min qty"
                />
                <input
                  className="adm-input"
                  type="number"
                  min={1}
                  value={item.maxQty}
                  onChange={(e) => updateItem(index, { maxQty: Number(e.target.value) })}
                  placeholder="Max qty"
                />
                <input
                  className="adm-input"
                  type="number"
                  min={0}
                  value={item.defaultQty}
                  onChange={(e) => updateItem(index, { defaultQty: Number(e.target.value) })}
                  placeholder="Default qty"
                />
              </div>

              <div className="adm-bundle-sizes">
                {(["small", "medium", "large"] as SizeType[]).map((size) => (
                  <label key={size}>
                    <input
                      type="checkbox"
                      checked={item.allowedSizes.includes(size)}
                      onChange={() => toggleSize(index, size)}
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="adm-action-row">
          <button className="adm-btn primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update Offer" : "Create Offer"}
          </button>
          {editingId && (
            <button className="adm-btn ghost" onClick={resetForm} type="button">
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="adm-panel">
        <h3 className="adm-subtitle">Existing Bundle Offers</h3>

        {loading ? (
          <div className="adm-empty">Loading bundle offers...</div>
        ) : offers.length === 0 ? (
          <div className="adm-empty">No bundle offers found.</div>
        ) : (
          <div className="adm-bundle-card-grid">
            {offers.map((offer) => (
              <article className="adm-bundle-card" key={offer._id}>
                <div className="adm-bundle-card-top">
                  <h4>{offer.name}</h4>
                  <span className={`adm-pill ${offer.isActive ? "paid" : "cancelled"}`}>
                    {offer.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p>{offer.description || "No description"}</p>
                <p>
                  <strong>{offer.planType}</strong> · {offer.discountPercent}% off
                </p>
                <ul className="adm-bundle-food-list">
                  {offer.items.map((item, index) => (
                    <li key={`${offer._id}-${index}`}>
                      {item.food?.name || "Food"} · Qty {item.minQty}-{item.maxQty} · Sizes {item.allowedSizes.join(", ")}
                    </li>
                  ))}
                </ul>
                <div className="adm-action-row">
                  <button className="adm-btn ghost" onClick={() => handleEdit(offer)}>
                    Edit
                  </button>
                  <button className="adm-btn danger" onClick={() => handleDelete(offer._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
