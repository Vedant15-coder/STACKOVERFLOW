import mongoose from "mongoose";

const paymentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    plan: {
        type: String,
        enum: ["BRONZE", "SILVER", "GOLD"],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "INR",
    },
    paymentGateway: {
        type: String,
        default: "RAZORPAY",
    },
    // Razorpay specific fields
    razorpayOrderId: {
        type: String,
        required: true,
    },
    razorpayPaymentId: {
        type: String,
        default: null,
    },
    razorpaySignature: {
        type: String,
        default: null,
    },
    // Invoice details
    invoiceId: {
        type: String,
        unique: true,
        required: true,
    },
    // Payment status
    status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED"],
        default: "PENDING",
    },
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
    },
    paidAt: {
        type: Date,
        default: null,
    },
});

// Index for efficient queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ invoiceId: 1 });

export default mongoose.model("payment", paymentSchema);
