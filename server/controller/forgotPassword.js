import User from "../models/auth.js";
import bcrypt from "bcryptjs";
import { generatePassword } from "../utils/passwordGenerator.js";
import { sendPasswordEmail, isValidEmail } from "../utils/emailService.js";

/**
 * Forgot Password Controller
 * 
 * Handles password reset requests with 24-hour rate limiting
 * 
 * SECURITY FEATURES:
 * - Rate limiting: Once per 24 hours
 * - Password hashing: bcrypt
 * - No plain passwords in responses
 * - Input validation
 * - Defensive error handling
 * 
 * v1: Email only (phone number support can be added later)
 */

/**
 * Request password reset
 * POST /user/forgot-password
 * 
 * @param {Object} req.body.email - User's email address
 * @returns {Object} Success message (no password exposed)
 */
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation: Email required
        if (!email || email.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        // Validation: Email format
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address"
            });
        }

        // Rate Limiting Check: 24-hour restriction
        const now = new Date();
        const lastRequest = user.resetPasswordRequestedAt;

        if (lastRequest) {
            const hoursSinceLastRequest = (now - lastRequest) / (1000 * 60 * 60);

            if (hoursSinceLastRequest < 24) {
                const hoursRemaining = Math.ceil(24 - hoursSinceLastRequest);
                return res.status(429).json({
                    success: false,
                    message: "You can request password reset only once per day. Please try again tomorrow.",
                    hoursRemaining
                });
            }
        }

        // Generate new password (8-10 chars, uppercase + lowercase only)
        const newPassword = generatePassword();

        // Hash password with bcrypt (same as signup)
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update user password and timestamp (atomic operation)
        user.password = hashedPassword;
        user.resetPasswordRequestedAt = now;
        await user.save();

        // Send password via email
        const emailResult = await sendPasswordEmail(email, newPassword);

        if (!emailResult.success) {
            // Email failed but password is already changed
            // User can still contact support
            return res.status(500).json({
                success: false,
                message: "Password was reset but email delivery failed. Please contact support."
            });
        }

        // Success response (NEVER include password)
        return res.status(200).json({
            success: true,
            message: "A new password has been sent to your registered email address. Please check your inbox."
        });

    } catch (error) {
        console.error("Error in requestPasswordReset:", error);

        // Generic error message (don't expose internal details)
        return res.status(500).json({
            success: false,
            message: "Failed to process your request. Please try again later."
        });
    }
};
