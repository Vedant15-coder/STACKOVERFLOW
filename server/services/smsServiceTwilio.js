/**
 * Twilio SMS Service for SMS OTP Delivery
 * Uses Twilio API to send OTP messages to phone numbers worldwide
 */

import twilio from 'twilio';

/**
 * Send mobile OTP via Twilio
 * @param {string} phoneNumber - Phone number with country code (e.g., +917276099151)
 * @param {string} otp - 6-digit OTP
 * @param {string} targetLanguage - Language user is switching to
 */
export const sendMobileOTP = async (phoneNumber, otp, targetLanguage) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !twilioPhoneNumber) {
            console.error('❌ Twilio credentials not found in environment variables');
            throw new Error('SMS service not configured');
        }

        const languageNames = {
            hi: "Hindi",
            es: "Spanish",
            pt: "Portuguese",
            zh: "Chinese",
        };

        // Initialize Twilio client
        const client = twilio(accountSid, authToken);

        // Prepare SMS message
        const message = `DevQuery Language Change: Your OTP to switch to ${languageNames[targetLanguage]} is ${otp}. Valid for 5 minutes. Do not share this code.`;

        // Send SMS via Twilio
        const result = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phoneNumber
        });

        console.log(`✅ SMS sent successfully via Twilio`);
        console.log(`📱 To: ${phoneNumber}`);
        console.log(`📨 Message SID: ${result.sid}`);
        console.log(`📊 Status: ${result.status}`);

        return {
            success: true,
            message: 'OTP sent successfully via SMS',
            sid: result.sid
        };
    } catch (error) {
        console.error('❌ Error sending mobile OTP via Twilio:', error.message);

        // Fallback: Log to console for debugging
        console.log('📱 [FALLBACK] SMS OTP (not sent due to error):');
        console.log(`To: ${phoneNumber}`);
        console.log(`OTP: ${otp}`);
        console.log(`Language: ${targetLanguage}`);

        throw new Error(`Failed to send mobile OTP: ${error.message}`);
    }
};

/**
 * Validate phone number format (international format)
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhoneNumber = (phoneNumber) => {
    // Must start with + and have 10-15 digits
    return /^\+\d{10,15}$/.test(phoneNumber);
};
