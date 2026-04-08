import mongoose from "mongoose";

const communityConnectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["connected", "dismissed"],
      default: "connected",
    },
  },
  { timestamps: true }
);

communityConnectionSchema.index({ requester: 1, target: 1 }, { unique: true });

const CommunityConnection = mongoose.model("CommunityConnection", communityConnectionSchema);

export default CommunityConnection;
