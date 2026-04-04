import Category from "../models/Category.js";

// ✅ CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.create({
      name,
    });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ALL
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const update = {
      ...(name !== undefined ? { name } : {}),
    };

    const category = await Category.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};