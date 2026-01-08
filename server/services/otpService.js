import bcrypt from "bcryptjs";
import crypto from "crypto";
import OTP from "../models/otp.js";

/**
 * OTP Service for language change verification
 * Handles OTP generation, storage, and verification
 */

/**
 * Generate a 6-digit random OTP
 */
export const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP using bcrypt before storage
 */
export const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
};

/**
 * Create and store OTP for language change
 * @param {string} userId - User ID
 * @param {string} channel - 'email' or 'mobile'
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<{otp: string, otpId: string}>}
 */
export const createLanguageOTP = async (userId, channel, targetLanguage) => {
    try {
        // Generate OTP
        const otp = generateOTP();
        const otpHash = await hashOTP(otp);

        // Set expiry to 5 minutes from now
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Invalidate any existing unverified OTPs for this user
        await OTP.updateMany(
            {
                userId,
                verified: false,
                purpose: "language_change",
            },
            {
                verified: true, // Mark as used to prevent reuse
            }
        );

        // Create new OTP record
        const otpRecord = await OTP.create({
            userId,
            otpHash,
            channel,
            purpose: "language_change",
            targetLanguage,
            expiresAt,
        });

        return {
            otp, // Plain OTP to send via email/SMS
            otpId: otpRecord._id.toString(),
        };
    } catch (error) {
        console.error("Error creating OTP:", error);
        throw new Error("Failed to create OTP");
    }
};

/**
 * Verify OTP and return target language if valid
 * @param {string} userId - User ID
 * @param {string} otp - Plain OTP from user
 * @returns {Promise<{valid: boolean, targetLanguage?: string, message?: string}>}
 */
export const verifyLanguageOTP = async (userId, otp) => {
    try {
        // Find the most recent unverified OTP for this user
        const otpRecord = await OTP.findOne({
            userId,
            verified: false,
            purpose: "language_change",
            expiresAt: { $gt: new Date() }, // Not expired
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return {
                valid: false,
                message: "No valid OTP found or OTP has expired",
            };
        }

        // Check rate limiting (max 3 attempts)
        if (otpRecord.attempts >= 3) {
            return {
                valid: false,
                message: "Maximum OTP attempts exceeded. Please request a new OTP.",
            };
        }

        // Increment attempt count
        otpRecord.attempts += 1;
        await otpRecord.save();

        // Verify OTP using constant-time comparison
        const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

        if (!isValid) {
            return {
                valid: false,
                message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`,
            };
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        return {
            valid: true,
            targetLanguage: otpRecord.targetLanguage,
        };
    } catch (error) {
        console.error("Error verifying OTP:", error);
        throw new Error("Failed to verify OTP");
    }
};

/**
 * Check if user can request new OTP (rate limiting)
 * Max 10 OTP requests per 15 minutes (increased for development)
 */
export const canRequestOTP = async (userId) => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const recentOTPs = await OTP.countDocuments({
        userId,
        createdAt: { $gte: fifteenMinutesAgo },
        purpose: "language_change",
    });

    return recentOTPs < 10; // Increased from 3 to 10 for development
};

/**
 * Create and store OTP for login verification
 * @param {string} userId - User ID
 * @param {string} channel - 'email' or 'mobile'
 * @returns {Promise<{otp: string, otpId: string}>}
 */
export const createLoginOTP = async (userId, channel = "email") => {
    try {
        // Generate OTP
        const otp = generateOTP();
        const otpHash = await hashOTP(otp);

        // Set expiry to 5 minutes from now
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Invalidate any existing unverified login OTPs for this user
        await OTP.updateMany(
            {
                userId,
                verified: false,
                purpose: "login_verification",
            },
            {
                verified: true, // Mark as used to prevent reuse
            }
        );

        // Create new OTP record
        const otpRecord = await OTP.create({
            userId,
            otpHash,
            channel,
            purpose: "login_verification",
            expiresAt,
        });

        return {
            otp, // Plain OTP to send via email
            otpId: otpRecord._id.toString(),
        };
    } catch (error) {
        console.error("Error creating login OTP:", error);
        throw new Error("Failed to create login OTP");
    }
};

/**
 * Verify login OTP
 * @param {string} userId - User ID
 * @param {string} otp - Plain OTP from user
 * @returns {Promise<{valid: boolean, message?: string}>}
 */
export const verifyLoginOTP = async (userId, otp) => {
    try {
        // Find the most recent unverified login OTP for this user
        const otpRecord = await OTP.findOne({
            userId,
            verified: false,
            purpose: "login_verification",
            expiresAt: { $gt: new Date() }, // Not expired
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return {
                valid: false,
                message: "No valid OTP found or OTP has expired",
            };
        }

        // Check rate limiting (max 3 attempts)
        if (otpRecord.attempts >= 3) {
            return {
                valid: false,
                message: "Maximum OTP attempts exceeded. Please request a new OTP.",
            };
        }

        // Increment attempt count
        otpRecord.attempts += 1;
        await otpRecord.save();

        // Verify OTP using constant-time comparison
        const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

        if (!isValid) {
            return {
                valid: false,
                message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`,
            };
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        return {
            valid: true,
        };
    } catch (error) {
        console.error("Error verifying login OTP:", error);
        throw new Error("Failed to verify login OTP");
    }
};

/**
 * Check if user can request new login OTP (rate limiting)
 * Max 5 login OTP requests per 15 minutes
 */
export const canRequestLoginOTP = async (userId) => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const recentOTPs = await OTP.countDocuments({
        userId,
        createdAt: { $gte: fifteenMinutesAgo },
        purpose: "login_verification",
    });

    return recentOTPs < 5;
};

