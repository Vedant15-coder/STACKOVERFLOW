/**
 * Subscription Utilities
 * 
 * Core business logic for subscription-based question posting system
 * - IST time window validation (10:00 AM - 11:00 AM strict)
 * - Question limit enforcement per plan
 * - Daily reset logic
 * - Invoice generation
 * 
 * SECURITY: All checks are backend-only, no trust in frontend
 */

import User from "../models/auth.js";

/**
 * Subscription plan configuration
 */
export const SUBSCRIPTION_PLANS = {
    FREE: {
        name: "FREE",
        price: 0,
        currency: "INR",
        questionLimit: 1,
        duration: null, // Never expires
    },
    BRONZE: {
        name: "BRONZE",
        price: 100,
        currency: "INR",
        questionLimit: 5,
        duration: 30, // days
    },
    SILVER: {
        name: "SILVER",
        price: 300,
        currency: "INR",
        questionLimit: 10,
        duration: 30, // days
    },
    GOLD: {
        name: "GOLD",
        price: 1000,
        currency: "INR",
        questionLimit: null, // Unlimited
        duration: 30, // days
    },
};

/**
 * Check if payment is allowed based on IST time window
 * CRITICAL: Payments only allowed between 10:00 AM - 11:00 AM IST
 * 
 * @returns {boolean} True if current time is within payment window
 */
export const isPaymentAllowedIST = () => {
    try {
        // Get current time in IST
        const now = new Date();
        const istTime = new Date(
            now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );

        const hour = istTime.getHours();

        // Payment allowed only between 10:00 AM (inclusive) and 11:00 AM (exclusive)
        return hour >= 10 && hour < 11;
    } catch (error) {
        console.error("Error checking IST time:", error);
        // Fail secure: if we can't determine time, block payment
        return false;
    }
};

/**
 * Get question limit for a subscription plan
 * 
 * @param {string} plan - Plan name (FREE, BRONZE, SILVER, GOLD)
 * @returns {number|null} Daily question limit, null = unlimited
 */
export const getQuestionLimit = (plan) => {
    const planConfig = SUBSCRIPTION_PLANS[plan];
    if (!planConfig) {
        return SUBSCRIPTION_PLANS.FREE.questionLimit; // Default to FREE
    }
    return planConfig.questionLimit;
};

/**
 * Check if user can post a question based on subscription limits
 * Handles daily reset logic automatically
 * 
 * @param {Object} user - User document from database
 * @returns {Object} { allowed: boolean, message: string, limit: number }
 */
export const canPostQuestion = async (user) => {
    try {
        // Get user's current plan
        const plan = user.subscription?.plan || "FREE";
        const limit = getQuestionLimit(plan);

        // GOLD plan = unlimited
        if (limit === null) {
            return {
                allowed: true,
                message: "Unlimited questions (GOLD plan)",
                limit: null,
            };
        }

        // Check if subscription has expired (for paid plans)
        if (plan !== "FREE" && user.subscription?.expiresAt) {
            const now = new Date();
            if (now > user.subscription.expiresAt) {
                // Subscription expired, downgrade to FREE
                user.subscription.plan = "FREE";
                user.subscription.expiresAt = null;
                user.subscription.dailyQuestionCount = 0;
                await user.save();

                return {
                    allowed: false,
                    message: "Your subscription has expired. You are now on FREE plan (1 question/day). Please upgrade to continue.",
                    limit: 1,
                };
            }
        }

        // Check if we need to reset daily count (new day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastQuestionDate = user.subscription?.lastQuestionDate
            ? new Date(user.subscription.lastQuestionDate)
            : null;

        if (lastQuestionDate) {
            lastQuestionDate.setHours(0, 0, 0, 0);
        }

        // Reset count if it's a new day
        if (!lastQuestionDate || lastQuestionDate < today) {
            user.subscription.dailyQuestionCount = 0;
            user.subscription.lastQuestionDate = null;
            await user.save();
        }

        // Check if user has reached daily limit
        const currentCount = user.subscription?.dailyQuestionCount || 0;

        if (currentCount >= limit) {
            return {
                allowed: false,
                message: `Daily question limit reached. You have posted ${currentCount}/${limit} questions today. Upgrade your plan for more questions.`,
                limit: limit,
                currentCount: currentCount,
                plan: plan,
            };
        }

        return {
            allowed: true,
            message: `You can post ${limit - currentCount} more question(s) today`,
            limit: limit,
            currentCount: currentCount,
            plan: plan,
        };
    } catch (error) {
        console.error("Error checking question limit:", error);
        // Fail secure: if error, block posting
        return {
            allowed: false,
            message: "Error checking subscription status. Please try again.",
            limit: 0,
        };
    }
};

/**
 * Increment user's daily question count after successful post
 * Uses atomic operation for thread safety
 * 
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const incrementQuestionCount = async (userId) => {
    try {
        await User.findByIdAndUpdate(
            userId,
            {
                $inc: { "subscription.dailyQuestionCount": 1 },
                $set: { "subscription.lastQuestionDate": new Date() },
            },
            { new: true }
        );
    } catch (error) {
        console.error("Error incrementing question count:", error);
        throw error;
    }
};

/**
 * Generate unique invoice ID
 * Format: INV-{timestamp}-{random}
 * 
 * @returns {string} Unique invoice ID
 */
export const generateInvoiceId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
    return `INV-${timestamp}-${random}`;
};

/**
 * Calculate subscription expiry date
 * 
 * @param {string} plan - Plan name
 * @returns {Date|null} Expiry date, null for FREE plan
 */
export const calculateSubscriptionExpiry = (plan) => {
    const planConfig = SUBSCRIPTION_PLANS[plan];

    if (!planConfig || plan === "FREE" || !planConfig.duration) {
        return null; // FREE plan never expires
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planConfig.duration);
    return expiryDate;
};

/**
 * Validate plan name
 * 
 * @param {string} plan - Plan name to validate
 * @returns {boolean} True if valid plan
 */
export const isValidPlan = (plan) => {
    return ["BRONZE", "SILVER", "GOLD"].includes(plan);
};

/**
 * Get plan details
 * 
 * @param {string} plan - Plan name
 * @returns {Object|null} Plan configuration or null
 */
export const getPlanDetails = (plan) => {
    return SUBSCRIPTION_PLANS[plan] || null;
};
