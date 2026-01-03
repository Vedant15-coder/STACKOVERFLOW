import mongoose from "mongoose";

const userschema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] },
  joinDate: { type: Date, default: Date.now },
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
});
export default mongoose.model("user", userschema);
