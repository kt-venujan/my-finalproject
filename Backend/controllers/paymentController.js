import Stripe from "stripe";
import Food from "../models/Food.js";
import KitchenOrder from "../models/KitchenOrder.js";
import User from "../models/User.js";
import BundleOffer from "../models/BundleOffer.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const ORDER_STATUSES = [
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
];
const PAYMENT_STATUSES = ["pending", "paid", "failed"];
const SIZE_MULTIPLIERS = {
  small: 1,
  medium: 1.25,
  large: 1.5,
};

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const buildLineItems = (items) => {
  return items.map((item) => {
    return {
      price_data: {
        currency: "lkr",
        product_data: {
          name: item.name,
          images: item.image ? [`${BACKEND_URL}${item.image}`] : [],
        },
        unit_amount: Math.round(Number(item.price || 0) * 100),
      },
      quantity: item.quantity,
    };
  });
};

const normalizeOrderItems = async (rawItems = []) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw createHttpError(400, "Cart is empty");
  }

  const foodIds = [...new Set(rawItems.map((item) => item.foodId).filter(Boolean))];

  const foods = await Food.find({ _id: { $in: foodIds } });
  const foodMap = new Map(foods.map((food) => [food._id.toString(), food]));

  const missingFood = rawItems.some((item) => !foodMap.has(String(item.foodId || "")));
  if (missingFood) {
    throw createHttpError(400, "Some foods are invalid");
  }

  const offerIds = [
    ...new Set(
      rawItems
        .map((item) => item.bundleOfferId)
        .filter((offerId) => Boolean(offerId))
    ),
  ];

  let offerMap = new Map();
  if (offerIds.length > 0) {
    const offers = await BundleOffer.find({ _id: { $in: offerIds }, isActive: true }).populate({
      path: "items.food",
      select: "_id",
    });

    offerMap = new Map(offers.map((offer) => [offer._id.toString(), offer]));
  }

  const normalizedItems = rawItems.map((item) => {
    const food = foodMap.get(String(item.foodId));
    const quantity = Math.max(1, Number(item.quantity || 1));
    const bundleOfferId = item.bundleOfferId ? String(item.bundleOfferId) : "";

    if (!bundleOfferId) {
      return {
        foodId: food._id,
        name: food.name,
        price: Number(food.price || 0),
        quantity,
        size: "small",
        image: food.image || "",
      };
    }

    const offer = offerMap.get(bundleOfferId);
    if (!offer) {
      throw createHttpError(400, "Invalid or inactive bundle offer");
    }

    const offerItem = offer.items.find(
      (offerEntry) => offerEntry.food?._id?.toString() === food._id.toString()
    );

    if (!offerItem) {
      throw createHttpError(400, `Food ${food.name} is not allowed for this bundle`);
    }

    const allowedSizes =
      Array.isArray(offerItem.allowedSizes) && offerItem.allowedSizes.length > 0
        ? offerItem.allowedSizes
        : ["small", "medium", "large"];

    const requestedSize = String(item.size || "small");
    const size = allowedSizes.includes(requestedSize) ? requestedSize : allowedSizes[0];

    const minQty = Number(offerItem.minQty ?? 0);
    const maxQty = Number(offerItem.maxQty ?? 20);

    if (quantity < minQty || quantity > maxQty) {
      throw createHttpError(
        400,
        `${food.name} quantity must be between ${minQty} and ${maxQty} for this bundle`
      );
    }

    const discountPercent = Number(offer.discountPercent || 0);
    const multiplier = SIZE_MULTIPLIERS[size] || 1;
    const unitPrice = Number(
      (Number(food.price || 0) * multiplier * (1 - discountPercent / 100)).toFixed(2)
    );

    return {
      foodId: food._id,
      name: `${food.name} (${size})`,
      price: unitPrice,
      quantity,
      size,
      image: food.image || "",
      bundleOffer: offer._id,
      bundleOfferName: offer.name,
      bundleDiscountPercent: discountPercent,
      bundlePlanType: offer.planType,
    };
  });

  const subtotal = Number(
    normalizedItems
      .reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)
      .toFixed(2)
  );

  return { normalizedItems, subtotal };
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { items, saveCard } = req.body;

    const { normalizedItems, subtotal } = await normalizeOrderItems(items);

    const order = await KitchenOrder.create({
      user: req.user._id,
      items: normalizedItems,
      subtotal,
      paymentMethod: "card",
      paymentStatus: "pending",
      status: "pending",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: buildLineItems(normalizedItems),
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout?cancelled=true`,
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
        saveCard: saveCard ? "true" : "false",
      },
    });

    order.stripeSessionId = session.id;
    await order.save();

    return res.status(200).json({ url: session.url, orderId: order._id });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const confirmCheckout = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "payment_intent.payment_method"],
    });

    const orderId = session?.metadata?.orderId;
    if (!orderId) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await KitchenOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (session.payment_status === "paid") {
      order.paymentStatus = "paid";
      // Paid card orders move directly into kitchen processing flow.
      order.status = "processing";
      order.paymentMethod = "card";
      order.paymentId = session.payment_intent?.id || "";
      order.stripePaymentIntentId = session.payment_intent?.id || "";
      await order.save();

      const saveCard = session?.metadata?.saveCard === "true";
      const paymentMethod = session.payment_intent?.payment_method;

      if (saveCard && paymentMethod && paymentMethod.card) {
        const card = paymentMethod.card;
        const user = await User.findById(req.user._id);
        const exists = user.savedCards?.some(
          (c) =>
            c.paymentMethodId === paymentMethod.id ||
            (c.last4 === card.last4 && c.brand === card.brand)
        );

        if (!exists) {
          user.savedCards.push({
            brand: card.brand,
            last4: card.last4,
            expMonth: card.exp_month,
            expYear: card.exp_year,
            paymentMethodId: paymentMethod.id,
          });
          await user.save();
        }
      }
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCashOrder = async (req, res) => {
  try {
    const { items } = req.body;

    const { normalizedItems, subtotal } = await normalizeOrderItems(items);

    const order = await KitchenOrder.create({
      user: req.user._id,
      items: normalizedItems,
      subtotal,
      paymentMethod: "cash_on_delivery",
      paymentStatus: "pending",
      status: "pending",
    });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const getMyKitchenOrders = async (req, res) => {
  try {
    const orders = await KitchenOrder.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllKitchenOrders = async (req, res) => {
  try {
    const orders = await KitchenOrder.find()
      .populate("user", "username email role")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateKitchenOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    if (status && !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const order = await KitchenOrder.findById(req.params.orderId).populate(
      "user",
      "username email role"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) {
      order.status = status;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (order.status === "paid") {
      order.paymentStatus = "paid";
    }

    if (order.status === "delivered" && order.paymentMethod === "card") {
      order.paymentStatus = "paid";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSavedCards = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("savedCards");
    return res.status(200).json(user?.savedCards || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSavedCard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedCards = user.savedCards.filter(
      (card) => card._id.toString() !== req.params.id
    );
    await user.save();
    return res.status(200).json({ success: true, cards: user.savedCards });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
