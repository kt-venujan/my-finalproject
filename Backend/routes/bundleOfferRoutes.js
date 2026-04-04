import express from "express";
import {
  createBundleOffer,
  deleteBundleOffer,
  getActiveBundleOffers,
  getBundleOffersAdmin,
  updateBundleOffer,
} from "../controllers/bundleOfferController.js";
import { protect } from "../middlewares/authMiddleware.js";
import allowRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getActiveBundleOffers);
router.get("/admin", protect, allowRoles("admin"), getBundleOffersAdmin);
router.post("/admin", protect, allowRoles("admin"), createBundleOffer);
router.put("/admin/:id", protect, allowRoles("admin"), updateBundleOffer);
router.delete("/admin/:id", protect, allowRoles("admin"), deleteBundleOffer);

export default router;
