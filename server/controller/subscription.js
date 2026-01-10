/**
 * Subscription Controller (MOCK RAZORPAY VERSION)
 * 
 * Handles all subscription and payment operations using MOCK Razorpay
 * NO REAL API KEYS, PAN, OR DASHBOARD REQUIRED
 * 
 * Perfect for:
 * - Student/internship projects
 * - Demonstrations
 * - Development/testing
 * 
 * Features:
 * - Payment order creation (with IST time validation)
 * - Payment verification (mock signature validation)
 * - Subscription status retrieval
 * 
 * SECURITY:
 * - All endpoints are JWT protected
 * - Payment time window enforced (10-11 AM IST)
 * - Mock signature verification (same logic as real Razorpay)
 * - Backend-only enforcement
 */

import crypto from "crypto";
import User from "../models/auth.js";
import Payment from "../models/payment.js";
import {
    isPaymentAllowedIST,
    isValidPlan,
    getPlanDetails,
    generateInvoiceId,
    calculateSubscriptionExpiry,
    getQuestionLimit,
} from "../utils/subscriptionUtils.js";
import { sendInvoiceEmail } from "../utils/emailServiceSendGrid.js";
import {
    getMockRazorpayInstance,
    verifyMockSignature,
} from "../utils/mockRazorpay.js";

// Initialize Mock Razorpay instance
let razorpayInstance = null;

const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        razorpayInstance = getMockRazorpayInstance();
        console.log("🎭 Using MOCK Razorpay (No real API keys needed)");
    }
    return razorpayInstance;
};

// Mock secret key for signature verification
const MOCK_SECRET_KEY = process.env.RAZORPAY_KEY_SECRET || "mock_secret_key_for_testing";

/**
 * Create payment order
 * POST /api/subscription/create-order
 * 
 * CRITICAL: Only allowed between 10:00 AM - 11:00 AM IST
 */
export const createPaymentOrder = async (req, res) => {
    try {
        const { plan } = req.body;
        const userId = req.userId; // From JWT middleware

        // CRITICAL: Check IST time window (10-11 AM)
        if (!isPaymentAllowedIST()) {
            return res.status(403).json({
                success: false,
                message:
                    "Payments are only allowed between 10:00 AM - 11:00 AM IST. Please try again during this time window.",
                paymentWindowClosed: true,
            });
        }

        // Validate plan
        if (!isValidPlan(plan)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription plan. Choose from BRONZE, SILVER, or GOLD.",
            });
        }

        // Get plan details
        const planDetails = getPlanDetails(plan);
        if (!planDetails) {
            return res.status(400).json({
                success: false,
                message: "Plan not found.",
            });
        }

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Check if user already has this plan or higher
        const currentPlan = user.subscription?.plan || "FREE";
        if (currentPlan === plan && user.subscription?.expiresAt > new Date()) {
            return res.status(400).json({
                success: false,
                message: `You already have an active ${plan} subscription.`,
            });
        }

        // Create Mock Razorpay order
        const razorpay = getRazorpayInstance();
        const amount = planDetails.price * 100; // Convert to paise

        const orderOptions = {
            amount: amount,
            currency: planDetails.currency,
            receipt: `receipt_${userId}_${Date.now()}`,
            notes: {
                userId: userId.toString(),
                plan: plan,
                userEmail: user.email,
            },
        };

        const order = await razorpay.orders.create(orderOptions);

        // Generate invoice ID
        const invoiceId = generateInvoiceId();

        // Create pending payment record
        const payment = new Payment({
            user: userId,
            plan: plan,
            amount: planDetails.price,
            currency: planDetails.currency,
            razorpayOrderId: order.id,
            invoiceId: invoiceId,
            status: "PENDING",
        });

        await payment.save();

        console.log(`🎭 Mock order created: ${order.id} for ${plan} plan`);

        // Return order details to frontend
        res.status(200).json({
            success: true,
            mockMode: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            plan: planDetails,
            invoiceId: invoiceId,
        });
    } catch (error) {
        console.error("Error creating payment order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order. Please try again.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/**
 * Verify payment and activate subscription
 * POST /api/subscription/verify-payment
 * 
 * SECURITY: Verifies mock signature to prevent tampering
 */
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;

        const userId = req.userId; // From JWT middleware

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details.",
            });
        }

        // Find payment record
        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
            user: userId,
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found.",
            });
        }

        // Verify Mock Razorpay signature (CRITICAL SECURITY CHECK)
        const isValidSignature = verifyMockSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            MOCK_SECRET_KEY
        );

        if (!isValidSignature) {
            // Invalid signature - possible tampering
            payment.status = "FAILED";
            await payment.save();

            console.log(`❌ Mock payment verification failed: Invalid signature`);

            return res.status(400).json({
                success: false,
                message: "Payment verification failed. Invalid signature.",
            });
        }

        // Signature verified - payment is legitimate
        console.log(`✅ Mock payment verified: ${razorpay_payment_id}`);

        // Update payment record
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = "SUCCESS";
        payment.paidAt = new Date();
        await payment.save();

        // Activate subscription
        const user = await User.findById(userId);
        const expiryDate = calculateSubscriptionExpiry(payment.plan);

        user.subscription.plan = payment.plan;
        user.subscription.expiresAt = expiryDate;
        user.subscription.dailyQuestionCount = 0; // Reset count on new subscription
        user.subscription.lastQuestionDate = null;
        await user.save();

        console.log(`🎉 Subscription activated: ${user.email} → ${payment.plan}`);

        // Send invoice email
        const invoiceData = {
            userName: user.name,
            plan: payment.plan,
            amount: payment.amount,
            invoiceId: payment.invoiceId,
            startDate: payment.paidAt,
            expiryDate: expiryDate,
        };

        const emailResult = await sendInvoiceEmail(user.email, invoiceData);
        if (!emailResult.success) {
            console.error("Failed to send invoice email:", emailResult.message);
            // Don't fail the payment if email fails
        }

        // Return success response
        res.status(200).json({
            success: true,
            mockMode: true,
            message: `Subscription activated successfully! You are now on ${payment.plan} plan.`,
            subscription: {
                plan: payment.plan,
                expiresAt: expiryDate,
                questionLimit: getQuestionLimit(payment.plan),
                invoiceId: payment.invoiceId,
            },
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify payment. Please contact support.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/**
 * Get subscription status
 * GET /api/subscription/status
 */
export const getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.userId; // From JWT middleware

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const plan = user.subscription?.plan || "FREE";
        const expiresAt = user.subscription?.expiresAt || null;
        const dailyQuestionCount = user.subscription?.dailyQuestionCount || 0;
        const questionLimit = getQuestionLimit(plan);

        // Check if subscription has expired
        let isExpired = false;
        if (plan !== "FREE" && expiresAt) {
            isExpired = new Date() > new Date(expiresAt);
        }

        // Get payment history
        const payments = await Payment.find({
            user: userId,
            status: "SUCCESS",
        })
            .sort({ paidAt: -1 })
            .limit(5)
            .select("plan amount invoiceId paidAt");

        res.status(200).json({
            success: true,
            mockMode: true,
            subscription: {
                plan: isExpired ? "FREE" : plan,
                expiresAt: isExpired ? null : expiresAt,
                isExpired: isExpired,
                questionLimit: isExpired ? getQuestionLimit("FREE") : questionLimit,
                questionsToday: dailyQuestionCount,
                remainingQuestions:
                    questionLimit === null
                        ? "unlimited"
                        : Math.max(0, questionLimit - dailyQuestionCount),
            },
            paymentHistory: payments,
        });
    } catch (error) {
        console.error("Error getting subscription status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get subscription status.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/**
 * Webhook handler (Mock version - for completeness)
 * POST /api/subscription/webhook
 */
export const webhookHandler = async (req, res) => {
    try {
        console.log("🎭 Mock webhook received (no real processing needed)");
        res.status(200).json({ success: true, mockMode: true });
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({
            success: false,
            message: "Webhook processing failed.",
        });
    }
};
