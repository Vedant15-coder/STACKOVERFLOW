/**
 * Mock SMS Service for Mobile OTP
 * In production, replace with Twilio, AWS SNS, or similar service
 */

/**
 * Send mobile OTP via SMS
 * @param {string} phoneNumber - User's mobile number
 * @param {string} otp - 6-digit OTP
 * @param {string} targetLanguage - Language user is switching to
 */
export const sendMobileOTP = async (phoneNumber, otp, targetLanguage) => {
    try {
        // Mock implementation - logs to console
        // In production, integrate with SMS provider

        const languageNames = {
            hi: "Hindi",
            es: "Spanish",
            pt: "Portuguese",
            zh: "Chinese",
        };

        const message = `DevQuery Language Change: Your OTP to switch to ${languageNames[targetLanguage]} is ${otp}. Valid for 5 minutes. Do not share this code.`;

        console.log("📱 [MOCK SMS SERVICE]");
        console.log(`To: ${phoneNumber}`);
        console.log(`Message: ${message}`);
        console.log(`OTP: ${otp}`);
        console.log("=".repeat(50));

        // Simulate SMS sending delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        return {
            success: true,
            message: "OTP sent successfully via SMS",
        };
    } catch (error) {
        console.error("Error sending mobile OTP:", error);
        throw new Error("Failed to send mobile OTP");
    }
};

/**
 * Production implementation example (commented out):
 * 
 * import twilio from 'twilio';
 * 
 * const client = twilio(
 *     process.env.TWILIO_ACCOUNT_SID,
 *     process.env.TWILIO_AUTH_TOKEN
 * );
 * 
 * export const sendMobileOTP = async (phoneNumber, otp, targetLanguage) => {
 *     const languageNames = {
 *         hi: "Hindi",
 *         es: "Spanish",
 *         pt: "Portuguese",
 *         zh: "Chinese",
 *     };
 * 
 *     const message = `DevQuery: Your OTP to switch to ${languageNames[targetLanguage]} is ${otp}. Valid for 5 minutes.`;
 * 
 *     await client.messages.create({
 *         body: message,
 *         from: process.env.TWILIO_PHONE_NUMBER,
 *         to: phoneNumber,
 *     });
 * 
 *     return { success: true, message: "OTP sent via SMS" };
 * };
 */
