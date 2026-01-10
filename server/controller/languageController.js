import User from "../models/auth.js";
import {
    createLanguageOTP,
    verifyLanguageOTP,
    canRequestOTP,
} from "../services/otpService.js";
import { sendLanguageOTP } from "../utils/emailServiceSendGrid.js";
import { sendMobileOTP } from "../services/smsServiceTwilio.js";
import { isValidIndianPhoneNumber, sanitizePhoneNumber } from "../utils/phoneValidator.js";

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
 * Check if target language requires SMS/phone number
 * @param {string} targetLanguage - Language code
 * @returns {boolean} True if phone number required
 */
const requiresSMS = (targetLanguage) => {
    // Hindi, Spanish, Portuguese, Chinese require phone numbers
    return ["hi", "es", "pt", "zh"].includes(targetLanguage);
};


/**
 * Request language change with OTP
 * POST /api/language/request-otp
 */
export const requestLanguageChange = async (req, res) => {
    try {
        const { targetLanguage, phoneNumber } = req.body;
        const userId = req.userId; // From JWT middleware (lowercase!)

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


        // Check if user has email for OTP (OTP is always sent via email for now)
        if (!user.email) {
            return res.status(400).json({
                success: false,
                message: "Email address required to send OTP for language change",
            });
        }

        // For SMS-enabled languages, validate and save phone number
        // BUT send OTP via email (workaround for SMS provider limitations)
        if (requiresSMS(targetLanguage)) {
            const phoneNumber = req.body.phoneNumber;

            if (!phoneNumber) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number required for this language",
                });
            }

            // Validate phone number format
            const cleanedPhone = sanitizePhoneNumber(phoneNumber);
            if (!isValidIndianPhoneNumber(cleanedPhone)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid 10-digit Indian phone number (starting with 6-9)",
                });
            }

            // Save phone number to user document
            user.phoneNumber = cleanedPhone;
            await user.save();

            console.log(`📱 Phone number saved for user: ${cleanedPhone}`);
        }

        // Create OTP (always for email channel as per new logic)
        const otp = await createLanguageOTP(userId, "email", targetLanguage);

        // Send OTP via email for all languages (including SMS languages)
        // This is a workaround for SMS provider limitations
        await sendLanguageOTP(user.email, otp, targetLanguage);

        console.log(`📧 OTP sent via email to ${user.email} for language: ${targetLanguage}`);

        return res.status(200).json({
            success: true,
            message: `OTP sent to your email`,
            requiresOTP: true,
            otpType: "email",
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
        const userId = req.userId; // From JWT middleware (lowercase!)

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
        const userId = req.userId; // From JWT middleware (lowercase!)

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
