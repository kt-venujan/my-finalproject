import mongoose from "mongoose";

const communityProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 60,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 400,
    },
    specialization: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    dietFocus: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    website: {
      type: String,
      default: "",
      trim: true,
      maxlength: 180,
    },
    coverImage: {
      type: String,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const CommunityProfile = mongoose.model("CommunityProfile", communityProfileSchema);

export default CommunityProfile;
