import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { communityUpload } from "../middlewares/imageUpload.js";
import {
  connectNetworkUser,
  createCommunityPost,
  dismissNetworkSuggestion,
  deleteCommunityPost,
  getCommunityFeed,
  getMyCommunityProfile,
  getMyCommunityPosts,
  getNetworkSuggestions,
  toggleCommunityLike,
  upsertMyCommunityProfile,
} from "../controllers/communityController.js";

const router = express.Router();

router.use(protect);

router.get("/posts", getCommunityFeed);
router.get("/network/suggestions", getNetworkSuggestions);
router.get("/me/posts", getMyCommunityPosts);
router.post("/network/connect/:targetUserId", connectNetworkUser);
router.post("/network/dismiss/:targetUserId", dismissNetworkSuggestion);
router.post("/posts", communityUpload.single("image"), createCommunityPost);
router.post("/posts/:postId/like", toggleCommunityLike);
router.delete("/posts/:postId", deleteCommunityPost);

router.get("/me/profile", getMyCommunityProfile);
router.put("/me/profile", communityUpload.single("coverImage"), upsertMyCommunityProfile);

export default router;
