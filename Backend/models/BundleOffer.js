import mongoose from "mongoose";

const bundleItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    defaultQty: {
      type: Number,
      default: 1,
      min: 0,
    },
    minQty: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxQty: {
      type: Number,
      default: 20,
      min: 1,
    },
    allowedSizes: {
      type: [String],
      enum: ["small", "medium", "large"],
      default: ["small", "medium", "large"],
    },
  },
  { _id: false }
);

const bundleOfferSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    planType: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 90,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    items: {
      type: [bundleItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const BundleOffer = mongoose.model("BundleOffer", bundleOfferSchema);

export default BundleOffer;
