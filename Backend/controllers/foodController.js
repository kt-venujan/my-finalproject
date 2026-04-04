
import Food from "../models/Food.js";

const buildImagePath = (req, file) => {
  if (!file) return "";
  return `/uploads/foods/${file.filename}`;
};

// ✅ CREATE FOOD
export const createFood = async (req, res) => {
  try {
    const { name, price, category, image } = req.body;

    const food = await Food.create({
      name,
      price: price !== undefined ? Number(price) : undefined,
      category,
      image: req.file ? buildImagePath(req, req.file) : image,
    });
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET FOOD (USER)
export const getFoods = async (req, res) => {
  try {
    const { category } = req.query;

    const foods = category
      ? await Food.find({ category })
      : await Food.find();

    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ DELETE FOOD
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json({ message: "Food deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE FOOD
export const updateFood = async (req, res) => {
  try {
    const { name, price, category, image } = req.body;

    const update = {
      ...(name !== undefined ? { name } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(req.file
        ? { image: buildImagePath(req, req.file) }
        : image !== undefined
        ? { image }
        : {}),
    };

    const food = await Food.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};