import mongoose from "mongoose";

const loginHistorySchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: false, // Optional to allow tracking failed attempts for non-existent users
        index: true,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    browser: {
        type: String,
        required: true,
    },
    browserVersion: {
        type: String,
        default: "Unknown",
    },
    os: {
        type: String,
        required: true,
    },
    deviceType: {
        type: String,
        enum: ["Desktop", "Laptop", "Mobile", "Tablet", "Unknown"],
        default: "Unknown",
    },
    platform: {
        type: String,
        default: "Web",
    },
    isMobile: {
        type: Boolean,
        default: false,
    },
    loginMethod: {
        type: String,
        enum: ["Password", "Email OTP", "Bypassed"],
        required: true,
    },
    loginStatus: {
        type: String,
        enum: ["Success", "Blocked"],
        required: true,
    },
    failureReason: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

// Compound index for efficient user-specific queries with sorting
loginHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("LoginHistory", loginHistorySchema);
