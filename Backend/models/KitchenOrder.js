import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "small",
    },
    bundleOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BundleOffer",
    },
    bundleOfferName: { type: String, default: "" },
    bundleDiscountPercent: { type: Number, default: 0 },
    bundlePlanType: {
      type: String,
      enum: ["weekly", "monthly"],
      default: undefined,
    },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const kitchenOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    currency: { type: String, default: "lkr" },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "cooking",
        "packed",
        "ready_to_deliver",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "card"],
      default: "cash_on_delivery",
    },
    paymentId: { type: String, default: "" },
    stripeSessionId: { type: String, default: "" },
    stripePaymentIntentId: { type: String, default: "" },
  },
  { timestamps: true }
);

const KitchenOrder = mongoose.model("KitchenOrder", kitchenOrderSchema);

export default KitchenOrder;
