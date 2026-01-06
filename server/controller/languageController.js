import User from "../models/auth.js";
import {
    createLanguageOTP,
    verifyLanguageOTP,
    canRequestOTP,
} from "../services/otpService.js";
import { sendLanguageOTP } from "../utils/emailService.js";
import { sendMobileOTP } from "../services/smsService.js";

/**
 * Language Controller
 * Handles language change requests with conditional OTP verification
 */

/**
 * Check if target language requires OTP verification
 * @param {string} targetLanguage - Language code
 * @returns {boolean} True if OTP required
 */
const requiresOTP = (targetLanguage) => {
    return targetLanguage !== "en";
};

/**
 * Determine OTP channel based on target language
 * @param {string} targetLanguage - Language code
 * @returns {string} 'email' for French, 'mobile' for others
 */
const getOTPChannel = (targetLanguage) => {
    return targetLanguage === "fr" ? "email" : "mobile";
};

/**
 * Request language change with OTP
 * POST /api/language/request-otp
 */
export const requestLanguageChange = async (req, res) => {
    try {
        const { targetLanguage } = req.body;
        const userId = req.userid; // From JWT middleware (lowercase!)

        // Validation
        const validLanguages = ["en", "hi", "es", "pt", "fr", "zh"];
        if (!validLanguages.includes(targetLanguage)) {
            return res.status(400).json({
                success: false,
                message: "Invalid language selected",
            });
        }

        // If switching to English, no OTP required
        if (!requiresOTP(targetLanguage)) {
            // Update language directly
            await User.findByIdAndUpdate(userId, { language: targetLanguage });
            return res.status(200).json({
                success: true,
                message: "Language updated successfully",
                requiresOTP: false,
            });
        }

        // Check rate limiting
        const canRequest = await canRequestOTP(userId);
        if (!canRequest) {
            return res.status(429).json({
                success: false,
                message: "Too many OTP requests. Please try again in 15 minutes.",
            });
        }

        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Determine OTP channel
        const channel = getOTPChannel(targetLanguage);

        // Check if user has required contact info
        if (channel === "email" && !user.email) {
            return res.status(400).json({
                success: false,
                message: "Email address required to switch to French",
            });
        }

        // Note: Mobile number field doesn't exist in current schema
        // For now, we'll use email as fallback for mobile OTP in development
        // In production, add mobile field to User schema

        // Create OTP
        const { otp } = await createLanguageOTP(userId, channel, targetLanguage);

        // Send OTP via appropriate channel
        if (channel === "email") {
            await sendLanguageOTP(user.email, otp, targetLanguage);
        } else {
            // Mock mobile OTP (use email as phone for development)
            await sendMobileOTP(user.email, otp, targetLanguage);
        }

        return res.status(200).json({
            success: true,
            message: `OTP sent to your ${channel}`,
            requiresOTP: true,
            otpType: channel, // 'email' or 'mobile'
        });
    } catch (error) {
        console.error("Error requesting language change:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process language change request",
        });
    }
};

/**
 * Verify OTP and update language
 * POST /api/language/verify-otp
 */
export const verifyOTPAndUpdateLanguage = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.userid; // From JWT middleware (lowercase!)

        if (!otp || otp.length !== 6) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP format. Please enter 6 digits.",
            });
        }

        // Verify OTP
        const verification = await verifyLanguageOTP(userId, otp);

        if (!verification.valid) {
            return res.status(400).json({
                success: false,
                message: verification.message,
            });
        }

        // Update user language
        await User.findByIdAndUpdate(userId, {
            language: verification.targetLanguage,
        });

        return res.status(200).json({
            success: true,
            message: "Language updated successfully",
            language: verification.targetLanguage,
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
        });
    }
};

/**
 * Get current user language
 * GET /api/language/current
 */
export const getCurrentLanguage = async (req, res) => {
    try {
        const userId = req.userid; // From JWT middleware (lowercase!)

        const user = await User.findById(userId).select("language");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            language: user.language || "en",
        });
    } catch (error) {
        console.error("Error getting current language:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get current language",
        });
    }
};
