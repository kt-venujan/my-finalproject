import BundleOffer from "../models/BundleOffer.js";

const normalizeItems = (items = []) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const minQty = Number(item.minQty ?? 0);
      const maxQty = Number(item.maxQty ?? 20);
      const defaultQty = Number(item.defaultQty ?? 1);
      const allowedSizes = Array.isArray(item.allowedSizes)
        ? item.allowedSizes.filter((size) => ["small", "medium", "large"].includes(size))
        : ["small", "medium", "large"];

      return {
        food: item.food || item.foodId,
        defaultQty: Number.isFinite(defaultQty) ? defaultQty : 1,
        minQty: Number.isFinite(minQty) ? minQty : 0,
        maxQty: Number.isFinite(maxQty) ? Math.max(maxQty, 1) : 20,
        allowedSizes: allowedSizes.length > 0 ? allowedSizes : ["small", "medium", "large"],
      };
    })
    .filter((item) => item.food);
};

const toBoolean = (value, fallback = true) => {
  if (value === undefined) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return Boolean(value);
};

const basePopulate = {
  path: "items.food",
  select: "name price image category",
};

export const getActiveBundleOffers = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.planType && ["weekly", "monthly"].includes(req.query.planType)) {
      filter.planType = req.query.planType;
    }

    const offers = await BundleOffer.find(filter)
      .populate(basePopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json(offers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBundleOffersAdmin = async (req, res) => {
  try {
    const offers = await BundleOffer.find()
      .populate(basePopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json(offers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createBundleOffer = async (req, res) => {
  try {
    const { name, description, planType, discountPercent, isActive, items } = req.body;

    if (!name || !planType) {
      return res.status(400).json({ message: "Name and plan type are required" });
    }

    const offer = await BundleOffer.create({
      name,
      description: description || "",
      planType,
      discountPercent: Number(discountPercent || 0),
      isActive: toBoolean(isActive, true),
      items: normalizeItems(items),
    });

    const populated = await BundleOffer.findById(offer._id).populate(basePopulate);

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateBundleOffer = async (req, res) => {
  try {
    const { name, description, planType, discountPercent, isActive, items } = req.body;

    const offer = await BundleOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Bundle offer not found" });
    }

    if (name !== undefined) offer.name = name;
    if (description !== undefined) offer.description = description;
    if (planType !== undefined) offer.planType = planType;
    if (discountPercent !== undefined) offer.discountPercent = Number(discountPercent);
    if (isActive !== undefined) offer.isActive = toBoolean(isActive, offer.isActive);
    if (items !== undefined) offer.items = normalizeItems(items);

    await offer.save();

    const populated = await BundleOffer.findById(offer._id).populate(basePopulate);

    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteBundleOffer = async (req, res) => {
  try {
    const offer = await BundleOffer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Bundle offer not found" });
    }

    return res.status(200).json({ success: true, message: "Bundle offer deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
