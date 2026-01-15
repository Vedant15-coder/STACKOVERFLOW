/**
 * Real Razorpay Service
 * 
 * Production-ready Razorpay integration for live payments
 * Uses official Razorpay SDK with live API keys
 */

import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Initialize Razorpay instance with live credentials
 * @returns {Razorpay} Razorpay instance
 */
export const getRazorpayInstance = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error("Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.");
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
};

/**
 * Verify Razorpay payment signature
 * Critical security check to prevent payment tampering
 * 
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
        throw new Error("Razorpay key secret not configured");
    }

    const message = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(message)
        .digest("hex");

    return signature === expectedSignature;
};

/**
 * Verify Razorpay webhook signature
 * Ensures webhook requests are from Razorpay
 * 
 * @param {string} webhookBody - Raw webhook body
 * @param {string} signature - X-Razorpay-Signature header
 * @param {string} webhookSecret - Webhook secret from Razorpay dashboard
 * @returns {boolean} True if webhook is authentic
 */
export const verifyWebhookSignature = (webhookBody, signature, webhookSecret) => {
    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(webhookBody)
        .digest("hex");

    return signature === expectedSignature;
};

/**
 * Create Razorpay order
 * @param {Object} orderOptions - Order creation options
 * @returns {Promise<Object>} Razorpay order
 */
export const createOrder = async (orderOptions) => {
    const razorpay = getRazorpayInstance();
    return await razorpay.orders.create(orderOptions);
};

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
export const fetchPayment = async (paymentId) => {
    const razorpay = getRazorpayInstance();
    return await razorpay.payments.fetch(paymentId);
};

/**
 * Check if using live mode
 * @returns {boolean} True if using live Razorpay keys
 */
export const isLiveMode = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    return keyId && keyId.startsWith("rzp_live_");
};

export default {
    getRazorpayInstance,
    verifyPaymentSignature,
    verifyWebhookSignature,
    createOrder,
    fetchPayment,
    isLiveMode,
};
