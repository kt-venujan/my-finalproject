"use client";

import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { FiCoffee, FiEdit2, FiPlus, FiTag, FiX } from "react-icons/fi";

type Food = {
  _id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
};

type Category = {
  _id: string;
  name: string;
};

export default function FoodPage() {
  const { user } = useAuth();

  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [foodImageFile, setFoodImageFile] = useState<File | null>(null);

  const [catName, setCatName] = useState("");

  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editFoodName, setEditFoodName] = useState("");
  const [editFoodPrice, setEditFoodPrice] = useState("");
  const [editFoodCategory, setEditFoodCategory] = useState("");
  const [editFoodImage, setEditFoodImage] = useState("");
  const [editFoodFile, setEditFoodFile] = useState<File | null>(null);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    return axiosError?.response?.data?.message || axiosError?.response?.data?.error || fallback;
  };

  const isAdmin = user?.role === "admin";

  const fetchFoods = async () => {
    try {
      const res = await api.get("/foods");
      setFoods(res.data || []);
    } catch (error) {
      console.error("Failed to fetch foods", error);
      setFoods([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) {
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchFoods();
      fetchCategories();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [user, isAdmin]);

  const resetFoodCreateForm = () => {
    setName("");
    setPrice("");
    setCategory("");
    setImage("");
    setFoodImageFile(null);
  };

  const resetCategoryCreateForm = () => {
    setCatName("");
  };

  const saveFood = async () => {
    if (!isAdmin) {
      toast.error("Admin access only");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category", category);

    if (foodImageFile) {
      formData.append("image", foodImageFile);
    } else if (image) {
      formData.append("image", image);
    }

    try {
      await api.post("/admin/foods", formData);
      resetFoodCreateForm();
      fetchFoods();
      toast.success("Food added");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to add food"));
    }
  };

  const saveCategory = async () => {
    if (!isAdmin) {
      toast.error("Admin access only");
      return;
    }

    const name = catName.trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }

    try {
      await api.post("/categories/create", { name });
      resetCategoryCreateForm();
      fetchCategories();
      toast.success("Category added");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to add category"));
    }
  };

  const deleteFood = async (id: string) => {
    if (!isAdmin) {
      toast.error("Admin access only");
      return;
    }

    try {
      await api.delete(`/admin/foods/${id}`);
      fetchFoods();
      toast.success("Food deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete food"));
    }
  };

  const deleteCategory = async (id: string) => {
    if (!isAdmin) {
      toast.error("Admin access only");
      return;
    }

    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
      fetchFoods();
      toast.success("Category deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete category"));
    }
  };

  const resolveImage = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  const openCategoryModal = (selected: Category) => {
    setEditingCategoryId(selected._id);
    setEditCatName(selected.name || "");
  };

  const closeCategoryModal = () => {
    setEditingCategoryId(null);
    setEditCatName("");
  };

  const saveCategoryEdit = async () => {
    if (!editingCategoryId) return;
    if (!isAdmin) {
      toast.error("Admin access only");
      return;
    }

    const name = editCatName.trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }

    try {
      await api.put(`/categories/${editingCategoryId}`, { name });
      closeCategoryModal();
      fetchCategories();
      fetchFoods();
      toast.success("Category updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update category"));
    }
  };

  const openFoodModal = (selected: Food) => {
    setEditingFoodId(selected._id);
    setEditFoodName(selected.name || "");
    setEditFoodPrice(String(selected.price ?? ""));
    setEditFoodCategory(selected.category || "");
    setEditFoodImage(selected.image || "");
    setEditFoodFile(null);
  };

  const closeFoodModal = () => {
    setEditingFoodId(null);
    setEditFoodName("");
    setEditFoodPrice("");
    setEditFoodCategory("");
    setEditFoodImage("");
    setEditFoodFile(null);
  };

  const saveFoodEdit = async () => {
    if (!editingFoodId) return;
    if (!isAdmin) {
      toast.error("Admin access only");
      return;
    }

    const formData = new FormData();
    formData.append("name", editFoodName);
    formData.append("price", editFoodPrice);
    formData.append("category", editFoodCategory);

    if (editFoodFile) {
      formData.append("image", editFoodFile);
    } else if (editFoodImage) {
      formData.append("image", editFoodImage);
    }

    try {
      await api.put(`/admin/foods/${editingFoodId}`, formData);
      closeFoodModal();
      fetchFoods();
      toast.success("Food updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update food"));
    }
  };

  if (user && !isAdmin) {
    return (
      <section className="adm-section">
        <div className="adm-panel">
          <h3 className="adm-subtitle">Admin Access Required</h3>
          <p>You are signed in without admin role. Category and food management is restricted.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="adm-section">
      <div className="adm-page-head">
        <h1 className="adm-title">Food Management</h1>
        <p>Add, edit, and organize kitchen products and categories.</p>
      </div>

      <div className="adm-food-create-grid">
        <div className="adm-panel">
          <h3 className="adm-subtitle">
            <FiTag />
            Add Category
          </h3>
          <input
            className="adm-input"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Category name"
          />
          <button className="adm-btn primary" onClick={saveCategory}>
            <FiPlus />
            Add Category
          </button>
        </div>

        <div className="adm-panel">
          <h3 className="adm-subtitle">
            <FiCoffee />
            Add Food
          </h3>
          <input
            className="adm-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Food name"
          />
          <input
            className="adm-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            type="number"
            min="0"
          />
          <select
            className="adm-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="adm-input"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/uploads/foods/item.jpg"
          />
          <input
            className="adm-input"
            type="file"
            accept="image/*"
            onChange={(e) => setFoodImageFile(e.target.files?.[0] || null)}
          />
          <button className="adm-btn primary" onClick={saveFood}>
            <FiPlus />
            Add Food
          </button>
        </div>
      </div>

      <div className="adm-panel">
        <h3 className="adm-subtitle">Categories</h3>
        <div className="adm-food-grid">
          {categories.map((c) => (
            <article className="adm-food-card" key={c._id}>
              <h4>{c.name}</h4>
              <div className="adm-action-row">
                <button className="adm-btn ghost" onClick={() => openCategoryModal(c)}>
                  <FiEdit2 />
                  Edit
                </button>
                <button className="adm-btn danger" onClick={() => deleteCategory(c._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="adm-panel">
        <h3 className="adm-subtitle">Foods</h3>
        <div className="adm-food-grid">
          {foods.map((f) => (
            <article className="adm-food-card" key={f._id}>
              {f.image && <img src={resolveImage(f.image)} alt={f.name} />}
              <h4>{f.name}</h4>
              <p>Rs. {f.price}</p>
              <span>{f.category}</span>
              <div className="adm-action-row">
                <button className="adm-btn ghost" onClick={() => openFoodModal(f)}>
                  <FiEdit2 />
                  Edit
                </button>
                <button className="adm-btn danger" onClick={() => deleteFood(f._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {editingCategoryId && (
        <div
          className="adm-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeCategoryModal()}
        >
          <div className="adm-modal">
            <button className="adm-modal-close" onClick={closeCategoryModal}>
              <FiX />
            </button>
            <h3>Edit Category</h3>
            <input
              className="adm-input"
              value={editCatName}
              onChange={(e) => setEditCatName(e.target.value)}
              placeholder="Category name"
            />
            <div className="adm-action-row">
              <button className="adm-btn primary" onClick={saveCategoryEdit}>
                Save Category
              </button>
              <button className="adm-btn ghost" onClick={closeCategoryModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingFoodId && (
        <div
          className="adm-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeFoodModal()}
        >
          <div className="adm-modal">
            <button className="adm-modal-close" onClick={closeFoodModal}>
              <FiX />
            </button>
            <h3>Edit Food</h3>
            <input
              className="adm-input"
              value={editFoodName}
              onChange={(e) => setEditFoodName(e.target.value)}
              placeholder="Food name"
            />
            <input
              className="adm-input"
              value={editFoodPrice}
              onChange={(e) => setEditFoodPrice(e.target.value)}
              placeholder="Price"
              type="number"
              min="0"
            />
            <select
              className="adm-select"
              value={editFoodCategory}
              onChange={(e) => setEditFoodCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className="adm-input"
              value={editFoodImage}
              onChange={(e) => setEditFoodImage(e.target.value)}
              placeholder="Image path"
            />
            <input
              className="adm-input"
              type="file"
              accept="image/*"
              onChange={(e) => setEditFoodFile(e.target.files?.[0] || null)}
            />
            <div className="adm-action-row">
              <button className="adm-btn primary" onClick={saveFoodEdit}>
                Save Food
              </button>
              <button className="adm-btn ghost" onClick={closeFoodModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
