/**
 * Fast2SMS Service for SMS OTP Delivery
 * Uses Fast2SMS API to send OTP messages to Indian phone numbers
 */

import axios from 'axios';

/**
 * Send mobile OTP via Fast2SMS
 * @param {string} phoneNumber - 10-digit Indian mobile number
 * @param {string} otp - 6-digit OTP
 * @param {string} targetLanguage - Language user is switching to
 */
export const sendMobileOTP = async (phoneNumber, otp, targetLanguage) => {
    try {
        const apiKey = process.env.FAST2SMS_API_KEY;

        if (!apiKey) {
            console.error('❌ FAST2SMS_API_KEY not found in environment variables');
            throw new Error('SMS service not configured');
        }

        const languageNames = {
            hi: "Hindi",
            es: "Spanish",
            pt: "Portuguese",
            zh: "Chinese",
        };

        // Fast2SMS API endpoint
        const url = 'https://www.fast2sms.com/dev/bulkV2';

        // Prepare request
        const response = await axios.post(url, {
            route: 'otp',
            variables_values: otp,
            numbers: phoneNumber
        }, {
            headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });

        // Check response
        if (response.data && response.data.return === true) {
            console.log(`✅ SMS sent successfully to ${phoneNumber}`);
            console.log(`📱 OTP: ${otp} for ${languageNames[targetLanguage]} language change`);

            return {
                success: true,
                message: 'OTP sent successfully via SMS',
            };
        } else {
            console.error('❌ Fast2SMS API error:', response.data);
            throw new Error('Failed to send SMS');
        }
    } catch (error) {
        console.error('❌ Error sending mobile OTP:', error.response?.data || error.message);

        // Fallback: Log to console for debugging
        console.log('📱 [FALLBACK] SMS OTP (not sent due to error):');
        console.log(`To: ${phoneNumber}`);
        console.log(`OTP: ${otp}`);
        console.log(`Language: ${targetLanguage}`);

        throw new Error('Failed to send mobile OTP. Please try again later.');
    }
};

/**
 * Validate Indian phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidIndianPhoneNumber = (phoneNumber) => {
    // Must be 10 digits, starting with 6-9
    return /^[6-9]\d{9}$/.test(phoneNumber);
};
