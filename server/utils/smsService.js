// smsService.js – 2Factor.in SMS OTP service for language changes

import axios from 'axios';

/**
 * Send language change OTP via SMS using 2Factor.in
 * @param {string} phoneNumber - 10-digit Indian phone number
 * @param {string} otp - 6-digit OTP
 * @param {string} targetLanguage - Target language code (es, hi, pt, zh, en)
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const sendLanguageSMS = async (phoneNumber, otp, targetLanguage) => {
    try {
        const languageNames = {
            es: 'Spanish',
            hi: 'Hindi',
            pt: 'Portuguese',
            zh: 'Chinese',
            en: 'English'
        };
        const languageName = languageNames[targetLanguage] || targetLanguage;

        // Mock mode - log to console
        if (process.env.SMS_MODE === 'mock') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📱 [MOCK MODE] Language Change SMS OTP');
            console.log(`To: +91${phoneNumber}`);
            console.log(`Target Language: ${languageName}`);
            console.log(`🔐 OTP: ${otp}`);
            console.log('Message: Your DevQuery language change OTP is ' + otp + '. Valid for 5 minutes. Do not share this code.');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return { success: true };
        }

        // Production mode - send via 2Factor.in
        const apiKey = process.env.TWOFACTOR_API_KEY;
        if (!apiKey) {
            throw new Error('TWOFACTOR_API_KEY is not configured in environment variables');
        }

        // Use 2Factor.in Transactional SMS API (not OTP API) to ensure SMS delivery
        // OTP API defaults to voice, Transactional SMS API sends actual SMS
        const message = `Your DevQuery language change OTP is ${otp}. Valid for 5 minutes. Do not share this code.`;
        const url = `https://2factor.in/API/V1/${apiKey}/ADDON_SERVICES/SEND/TSMS`;

        const response = await axios.post(url, {
            From: 'DVQURY', // 6-char sender ID
            To: phoneNumber,
            Msg: message
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });

        if (response.data && (response.data.Status === 'Success' || response.data.Details)) {
            console.log(`✅ SMS OTP sent successfully to +91${phoneNumber}`);
            return { success: true };
        } else {
            console.error('2Factor.in API error:', response.data);
            return {
                success: false,
                message: 'Failed to send SMS. Please try again later.'
            };
        }

    } catch (error) {
        console.error('Error sending SMS OTP:', error.message);

        // Handle specific error cases
        if (error.code === 'ECONNABORTED') {
            return {
                success: false,
                message: 'SMS service timeout. Please try again.'
            };
        }

        if (error.response) {
            console.error('2Factor.in API response error:', error.response.data);
            return {
                success: false,
                message: 'SMS service error. Please try again later.'
            };
        }

        return {
            success: false,
            message: 'Failed to send SMS. Please try again later.'
        };
    }
};

/**
 * Send login verification OTP via SMS using 2Factor.in
 * @param {string} phoneNumber - 10-digit Indian phone number
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const sendLoginSMS = async (phoneNumber, otp) => {
    try {
        // Mock mode - log to console
        if (process.env.SMS_MODE === 'mock') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📱 [MOCK MODE] Login Verification SMS OTP');
            console.log(`To: +91${phoneNumber}`);
            console.log(`🔐 OTP: ${otp}`);
            console.log('Message: Your DevQuery login OTP is ' + otp + '. Valid for 5 minutes. Do not share this code.');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return { success: true };
        }

        // Production mode - send via 2Factor.in
        const apiKey = process.env.TWOFACTOR_API_KEY;
        if (!apiKey) {
            throw new Error('TWOFACTOR_API_KEY is not configured in environment variables');
        }

        // Use 2Factor.in Transactional SMS API (not OTP API) to ensure SMS delivery
        const message = `Your DevQuery login OTP is ${otp}. Valid for 5 minutes. Do not share this code.`;
        const url = `https://2factor.in/API/V1/${apiKey}/ADDON_SERVICES/SEND/TSMS`;

        const response = await axios.post(url, {
            From: 'DVQURY', // 6-char sender ID
            To: phoneNumber,
            Msg: message
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.data && (response.data.Status === 'Success' || response.data.Details)) {
            console.log(`✅ Login SMS OTP sent successfully to +91${phoneNumber}`);
            return { success: true };
        } else {
            console.error('2Factor.in API error:', response.data);
            return {
                success: false,
                message: 'Failed to send SMS. Please try again later.'
            };
        }

    } catch (error) {
        console.error('Error sending login SMS OTP:', error.message);

        if (error.code === 'ECONNABORTED') {
            return {
                success: false,
                message: 'SMS service timeout. Please try again.'
            };
        }

        if (error.response) {
            console.error('2Factor.in API response error:', error.response.data);
            return {
                success: false,
                message: 'SMS service error. Please try again later.'
            };
        }

        return {
            success: false,
            message: 'Failed to send SMS. Please try again later.'
        };
    }
};

/**
 * Validate Indian phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean}
 */
export const isValidPhoneNumber = (phoneNumber) => {
    // Must be 10 digits starting with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
};
