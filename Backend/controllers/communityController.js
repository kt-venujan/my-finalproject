import CommunityPost from "../models/CommunityPost.js";
import CommunityProfile from "../models/CommunityProfile.js";
import CommunityConnection from "../models/CommunityConnection.js";
import User from "../models/User.js";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 30;

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
  const requestedLimit = parseInt(query.limit || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE);

  return { page, limit };
};

const toCommunityUser = (user) => ({
  id: user?._id,
  username: user?.username || "User",
  role: user?.role || "user",
  avatar: user?.avatar || "",
});

const toProfilePayload = (profile, fallbackUser) => {
  const source = profile || {};

  return {
    user: toCommunityUser(fallbackUser),
    displayName: source.displayName || fallbackUser?.username || "",
    bio: source.bio || "",
    specialization: source.specialization || "",
    location: source.location || "",
    dietFocus: source.dietFocus || "",
    website: source.website || "",
    coverImage: source.coverImage || "",
    isPublic: source.isPublic !== false,
  };
};

const toPostPayload = (post, currentUserId) => {
  const likes = Array.isArray(post.likes) ? post.likes : [];
  const likedByMe = likes.some((id) => String(id) === String(currentUserId));

  return {
    id: post._id,
    author: toCommunityUser(post.author),
    content: post.content || "",
    image: post.image || "",
    likesCount: likes.length,
    likedByMe,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

const buildHeadline = (user, profile) => {
  const role = String(user?.role || "").trim().toLowerCase();

  if (role === "dietician") {
    if (profile?.specialization) {
      return `${profile.specialization} | Dietician`;
    }
    return "Certified Dietician";
  }

  if (role === "kitchen") {
    return "Healthy Kitchen Specialist";
  }

  return profile?.dietFocus || "Dietara Community Member";
};

const toNetworkPayload = (user, profile, index) => {
  const stable = (String(user?._id || "").charCodeAt(0) + index * 7) % 47;
  const mutualCount = 2 + stable;

  return {
    id: user._id,
    username: user.username,
    role: user.role,
    avatar: user.avatar || "",
    location: profile?.location || "",
    headline: buildHeadline(user, profile),
    mutualCount,
  };
};

export const getCommunityFeed = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      CommunityPost.find({})
        .populate("author", "username avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CommunityPost.countDocuments(),
    ]);

    const items = posts.map((post) => toPostPayload(post, req.user._id));
    const hasMore = skip + items.length < total;

    return res.status(200).json({
      success: true,
      page,
      limit,
      hasMore,
      total,
      posts: items,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load community feed" });
  }
};

export const getNetworkSuggestions = async (req, res) => {
  try {
    const requestedLimit = parseInt(req.query.limit || "24", 10) || 24;
    const limit = Math.min(Math.max(requestedLimit, 8), 40);

    const existing = await CommunityConnection.find({ requester: req.user._id })
      .select("target")
      .lean();

    const excluded = new Set([String(req.user._id)]);
    for (const item of existing) {
      excluded.add(String(item.target));
    }

    const candidates = await User.find({
      _id: { $nin: Array.from(excluded) },
      isActive: { $ne: false },
    })
      .select("username avatar role")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const candidateIds = candidates.map((item) => item._id);
    const profiles = await CommunityProfile.find({ user: { $in: candidateIds } })
      .select("user location specialization dietFocus")
      .lean();

    const profileMap = new Map(profiles.map((p) => [String(p.user), p]));

    const items = candidates.map((candidate, index) =>
      toNetworkPayload(candidate, profileMap.get(String(candidate._id)), index)
    );

    const midpoint = Math.ceil(items.length / 2);

    return res.status(200).json({
      success: true,
      sections: {
        fromCommunity: items.slice(0, midpoint),
        fromActivity: items.slice(midpoint),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load network suggestions" });
  }
};

export const connectNetworkUser = async (req, res) => {
  try {
    const targetUserId = String(req.params.targetUserId || "").trim();

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user is required" });
    }

    if (String(req.user._id) === targetUserId) {
      return res.status(400).json({ message: "You cannot connect with yourself" });
    }

    const targetUser = await User.findById(targetUserId).select("_id").lean();
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await CommunityConnection.findOneAndUpdate(
      { requester: req.user._id, target: targetUserId },
      { $set: { status: "connected" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Connection sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to connect user" });
  }
};

export const dismissNetworkSuggestion = async (req, res) => {
  try {
    const targetUserId = String(req.params.targetUserId || "").trim();

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user is required" });
    }

    if (String(req.user._id) === targetUserId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const targetUser = await User.findById(targetUserId).select("_id").lean();
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await CommunityConnection.findOneAndUpdate(
      { requester: req.user._id, target: targetUserId },
      { $set: { status: "dismissed" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Suggestion dismissed" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to dismiss suggestion" });
  }
};

export const getMyCommunityPosts = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      CommunityPost.find({ author: req.user._id })
        .populate("author", "username avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CommunityPost.countDocuments({ author: req.user._id }),
    ]);

    const items = posts.map((post) => toPostPayload(post, req.user._id));
    const hasMore = skip + items.length < total;

    return res.status(200).json({
      success: true,
      page,
      limit,
      hasMore,
      total,
      posts: items,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load your posts" });
  }
};

export const createCommunityPost = async (req, res) => {
  try {
    const content = String(req.body.content || "").trim();

    if (!content && !req.file) {
      return res.status(400).json({ message: "Post text or image is required" });
    }

    const image = req.file ? `/uploads/community/${req.file.filename}` : "";

    const post = await CommunityPost.create({
      author: req.user._id,
      content,
      image,
      likes: [],
    });

    const populated = await CommunityPost.findById(post._id)
      .populate("author", "username avatar role")
      .lean();

    return res.status(201).json({
      success: true,
      post: toPostPayload(populated, req.user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create post" });
  }
};

export const toggleCommunityLike = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId).populate("author", "username avatar role");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const currentUserId = String(req.user._id);
    const existingIndex = post.likes.findIndex((id) => String(id) === currentUserId);

    if (existingIndex >= 0) {
      post.likes.splice(existingIndex, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    return res.status(200).json({
      success: true,
      post: toPostPayload(post.toObject(), req.user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update like" });
  }
};

export const deleteCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isOwner = String(post.author) === String(req.user._id);
    const isAdmin = String(req.user.role || "").trim().toLowerCase() === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You can delete only your own posts" });
    }

    await post.deleteOne();

    return res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete post" });
  }
};

export const getMyCommunityProfile = async (req, res) => {
  try {
    const profile = await CommunityProfile.findOne({ user: req.user._id }).lean();

    return res.status(200).json({
      success: true,
      profile: toProfilePayload(profile, req.user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load profile" });
  }
};

export const upsertMyCommunityProfile = async (req, res) => {
  try {
    const update = {
      displayName: String(req.body.displayName || "").trim(),
      bio: String(req.body.bio || "").trim(),
      specialization: String(req.body.specialization || "").trim(),
      location: String(req.body.location || "").trim(),
      dietFocus: String(req.body.dietFocus || "").trim(),
      website: String(req.body.website || "").trim(),
      isPublic:
        req.body.isPublic === undefined
          ? true
          : String(req.body.isPublic).toLowerCase() !== "false",
    };

    if (req.file) {
      update.coverImage = `/uploads/community/${req.file.filename}`;
    }

    const profile = await CommunityProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Community profile updated",
      profile: toProfilePayload(profile, req.user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update profile" });
  }
};
