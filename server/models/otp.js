import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    channel: {
        type: String,
        enum: ["email", "mobile"],
        required: true,
    },
    purpose: {
        type: String,
        default: "language_change",
    },
    targetLanguage: {
        type: String,
        enum: ["en", "hi", "es", "pt", "fr", "zh"],
        required: true,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
        required: true,
        // MongoDB TTL index - auto-delete expired OTPs
        index: { expireAfterSeconds: 0 },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index for fast lookups
otpSchema.index({ userId: 1, verified: 1, expiresAt: 1 });

export default mongoose.model("OTP", otpSchema);
