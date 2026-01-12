import User from "../models/auth.js";
import {
    createLanguageOTP,
    verifyLanguageOTP,
    canRequestOTP,
} from "../services/otpService.js";
import { sendLanguageOTP, shouldUseSMS } from "../utils/emailService.js";
import { sendLanguageSMS, isValidPhoneNumber } from "../utils/smsService.js";

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
    // All languages require OTP (no exceptions)
    return true;
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

        // All languages now require OTP verification
        // (This block is kept for backward compatibility but will never execute)

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


        // Determine delivery method based on target language
        const useSMS = shouldUseSMS(targetLanguage);

        if (useSMS) {
            // SMS languages: es, hi, pt, zh, en
            // Check if phone number is provided or already exists
            let phoneToUse = user.phoneNumber;

            if (phoneNumber) {
                // Validate and save new phone number
                if (!isValidPhoneNumber(phoneNumber)) {
                    return res.status(400).json({
                        success: false,
                        message: "Please enter a valid 10-digit Indian phone number (starting with 6-9)",
                    });
                }
                phoneToUse = phoneNumber;
                user.phoneNumber = phoneNumber;
                await user.save();
                console.log(`📱 Phone number saved for user: ${phoneNumber}`);
            } else if (!phoneToUse) {
                // No phone number provided and none on file
                return res.status(400).json({
                    success: false,
                    message: "Phone number required for this language",
                    requiresPhoneNumber: true,
                });
            }

            // Create OTP for SMS channel
            const { otp } = await createLanguageOTP(userId, "mobile", targetLanguage);

            // Send OTP via SMS using 2Factor.in
            const smsResult = await sendLanguageSMS(phoneToUse, otp, targetLanguage);

            if (!smsResult.success) {
                return res.status(500).json({
                    success: false,
                    message: smsResult.message || "Failed to send SMS. Please try again.",
                });
            }

            console.log(`📱 OTP sent via SMS to ${phoneToUse} for language: ${targetLanguage}`);

            return res.status(200).json({
                success: true,
                message: `OTP sent to your phone ending in ${phoneToUse.slice(-4)}`,
                requiresOTP: true,
                channel: "sms",
            });
        } else {
            // Email language: fr (French)
            if (!user.email) {
                return res.status(400).json({
                    success: false,
                    message: "Email address required to send OTP for language change",
                });
            }

            // Create OTP for email channel
            const { otp } = await createLanguageOTP(userId, "email", targetLanguage);

            // Send OTP via email
            await sendLanguageOTP(user.email, otp, targetLanguage);

            console.log(`📧 OTP sent via email to ${user.email} for language: ${targetLanguage}`);

            return res.status(200).json({
                success: true,
                message: `OTP sent to your email`,
                requiresOTP: true,
                channel: "email",
            });
        }
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
