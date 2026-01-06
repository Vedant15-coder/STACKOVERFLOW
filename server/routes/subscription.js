import express from "express";
import {
    createPaymentOrder,
    verifyPayment,
    getSubscriptionStatus,
    webhookHandler,
} from "../controller/subscription.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * Subscription Routes
 * All routes except webhook are JWT protected
 */

// Create payment order (JWT protected, IST time window enforced)
router.post("/create-order", auth, createPaymentOrder);

// Verify payment and activate subscription (JWT protected)
router.post("/verify-payment", auth, verifyPayment);

// Get subscription status (JWT protected)
router.get("/status", auth, getSubscriptionStatus);

// Razorpay webhook (no JWT, uses signature verification)
router.post("/webhook", webhookHandler);

export default router;
