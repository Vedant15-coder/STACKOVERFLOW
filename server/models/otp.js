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
        enum: ["language_change", "login_verification", "password_reset"],
        default: "language_change",
    },
    targetLanguage: {
        type: String,
        enum: ["en", "hi", "es", "pt", "fr", "zh"],
        required: function () {
            // Only required for language_change purpose
            return this.purpose === "language_change";
        },
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
