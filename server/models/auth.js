import mongoose from "mongoose";

const userschema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] },
  joinDate: { type: Date, default: Date.now },
  // Reward System field (backward-compatible with default)
  points: { type: Number, default: 0 },
  // Public Space fields (backward-compatible with defaults)
  friends: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
    default: [],
  },
  friendRequests: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
    default: [],
  },
  dailyPostCount: {
    type: Number,
    default: 0,
  },
  lastPostDate: {
    type: Date,
    default: null,
  },
  // Forgot Password field (for rate limiting)
  resetPasswordRequestedAt: {
    type: Date,
    default: null,
  },
  // Multi-language support (backward-compatible with default)
  language: {
    type: String,
    enum: ["en", "hi", "es", "pt", "fr", "zh"],
    default: "en",
  },
  // Subscription fields (backward-compatible with defaults)
  subscription: {
    plan: {
      type: String,
      enum: ["FREE", "BRONZE", "SILVER", "GOLD"],
      default: "FREE",
    },
    expiresAt: {
      type: Date,
      default: null, // null = FREE plan (never expires)
    },
    dailyQuestionCount: {
      type: Number,
      default: 0,
    },
    lastQuestionDate: {
      type: Date,
      default: null,
    },
  },
});
export default mongoose.model("user", userschema);
