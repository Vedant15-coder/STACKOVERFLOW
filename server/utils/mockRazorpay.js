/**
 * Mock Razorpay Service
 * 
 * Simulates Razorpay payment gateway for demonstration purposes
 * NO REAL API KEYS REQUIRED - Perfect for student/internship projects
 * 
 * Architecture matches real Razorpay for easy migration later
 * 
 * FEATURES:
 * - Mock order creation
 * - Mock payment verification
 * - Mock signature generation
 * - Razorpay-compatible response format
 */

import crypto from "crypto";

/**
 * Mock Razorpay Class
 * Simulates Razorpay SDK behavior without requiring real credentials
 */
class MockRazorpay {
    constructor(config = {}) {
        this.key_id = config.key_id || "rzp_test_mock_key_id";
        this.key_secret = config.key_secret || "mock_secret_key_for_testing";
        console.log("🎭 Mock Razorpay initialized (NO REAL API KEYS NEEDED)");
    }

    /**
     * Mock Orders API
     */
    get orders() {
        return {
            /**
             * Create mock order
             * Simulates Razorpay order creation
             */
            create: async (orderOptions) => {
                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Generate mock order ID
                const orderId = `order_mock_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`;

                // Return Razorpay-compatible response
                return {
                    id: orderId,
                    entity: "order",
                    amount: orderOptions.amount,
                    amount_paid: 0,
                    amount_due: orderOptions.amount,
                    currency: orderOptions.currency || "INR",
                    receipt: orderOptions.receipt,
                    status: "created",
                    attempts: 0,
                    notes: orderOptions.notes || {},
                    created_at: Math.floor(Date.now() / 1000),
                };
            },
        };
    }

    /**
     * Mock Payments API
     */
    get payments() {
        return {
            /**
             * Fetch mock payment details
             */
            fetch: async (paymentId) => {
                await new Promise((resolve) => setTimeout(resolve, 300));

                return {
                    id: paymentId,
                    entity: "payment",
                    amount: 10000,
                    currency: "INR",
                    status: "captured",
                    method: "card",
                    captured: true,
                    created_at: Math.floor(Date.now() / 1000),
                };
            },
        };
    }
}

/**
 * Generate mock Razorpay signature
 * Simulates signature generation for payment verification
 * 
 * @param {string} orderId - Order ID
 * @param {string} paymentId - Payment ID
 * @param {string} secret - Secret key
 * @returns {string} Mock signature
 */
export const generateMockSignature = (orderId, paymentId, secret) => {
    const message = `${orderId}|${paymentId}`;
    return crypto.createHmac("sha256", secret).update(message).digest("hex");
};

/**
 * Verify mock Razorpay signature
 * Simulates Razorpay signature verification
 * 
 * @param {string} orderId - Order ID
 * @param {string} paymentId - Payment ID
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean} True if signature is valid
 */
export const verifyMockSignature = (orderId, paymentId, signature, secret) => {
    const expectedSignature = generateMockSignature(orderId, paymentId, secret);
    return signature === expectedSignature;
};

/**
 * Generate mock payment ID
 * Creates a Razorpay-style payment ID
 * 
 * @returns {string} Mock payment ID
 */
export const generateMockPaymentId = () => {
    return `pay_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Simulate successful payment
 * For frontend testing - generates valid payment response
 * 
 * @param {string} orderId - Order ID
 * @param {string} keySecret - Razorpay key secret
 * @returns {Object} Mock payment response
 */
export const simulateSuccessfulPayment = (orderId, keySecret) => {
    const paymentId = generateMockPaymentId();
    const signature = generateMockSignature(orderId, paymentId, keySecret);

    return {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
    };
};

/**
 * Get mock Razorpay instance
 * Returns configured mock Razorpay client
 * 
 * @returns {MockRazorpay} Mock Razorpay instance
 */
export const getMockRazorpayInstance = () => {
    return new MockRazorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_id",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret_key_for_testing",
    });
};

/**
 * Check if using mock mode
 * Determines if we're using mock Razorpay or real API
 * 
 * @returns {boolean} True if using mock mode
 */
export const isMockMode = () => {
    // Use mock mode if no real keys configured or explicitly enabled
    const hasRealKeys =
        process.env.RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_KEY_SECRET &&
        !process.env.RAZORPAY_KEY_ID.includes("mock") &&
        process.env.RAZORPAY_KEY_ID.startsWith("rzp_");

    return !hasRealKeys || process.env.USE_MOCK_RAZORPAY === "true";
};

export default MockRazorpay;
