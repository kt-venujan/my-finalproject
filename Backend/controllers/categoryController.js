import Category from "../models/Category.js";
import Food from "../models/Food.js";

const normalizeCategoryName = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findCategoryByName = (name, excludeId) => {
  const query = {
    name: {
      $regex: new RegExp(`^${escapeRegex(name)}$`, "i"),
    },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Category.findOne(query);
};

// ✅ CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const name = normalizeCategoryName(req.body?.name);

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const existing = await findCategoryByName(name);
    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }

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
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Keep existing foods visible even if an admin deletes a category.
    await Food.updateMany(
      { category: category.name },
      { $set: { category: "Uncategorized" } }
    );

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const nextName = normalizeCategoryName(req.body?.name);
    if (!nextName) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const unchanged = category.name.toLowerCase() === nextName.toLowerCase();
    if (unchanged) {
      return res.json(category);
    }

    const duplicate = await findCategoryByName(nextName, category._id);
    if (duplicate) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const oldName = category.name;
    category.name = nextName;
    await category.save();

    // Foods store category as a string, so rename must be propagated.
    await Food.updateMany({ category: oldName }, { $set: { category: nextName } });

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};