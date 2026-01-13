import axios from 'axios';

/**
 * 2Factor.in Transactional SMS (TSMS) Service
 * 
 * CRITICAL: This uses TSMS endpoint which sends SMS ONLY
 * - NO voice call support
 * - NO automatic fallback to calls
 * - NO session IDs
 * - Transactional SMS only
 * 
 * API Documentation: https://2factor.in/docs/
 */

/**
 * Send SMS OTP using 2Factor.in TSMS API (SMS ONLY - NO VOICE CALLS)
 * @param {string} phoneNumber - 10-digit Indian mobile number
 * @param {string} otp - 4-digit OTP code
 * @param {string} targetLanguage - Target language code (for logging)
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const sendMobileOTP = async (phoneNumber, otp, targetLanguage = 'unknown') => {
    try {
        const apiKey = process.env.TWOFACTOR_API_KEY;
        const smsMode = process.env.SMS_MODE || 'real';

        // Validate API key
        if (!apiKey) {
            console.error('❌ 2Factor API key not found in environment variables');
            throw new Error('2Factor API key not configured');
        }

        // Validate phone number (10 digits)
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
            throw new Error('Invalid phone number format. Must be 10 digits.');
        }

        // Validate OTP (4 digits)
        if (!/^\d{4}$/.test(otp)) {
            throw new Error('Invalid OTP format. Must be 4 digits.');
        }

        // Mock mode - log OTP without sending
        if (smsMode === 'mock') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📱 [MOCK MODE] 2Factor TSMS (SMS ONLY)');
            console.log(`Phone: +91${cleanPhone}`);
            console.log(`Language: ${targetLanguage}`);
            console.log(`🔐 OTP: ${otp}`);
            console.log(`Sender: DEVQRY`);
            console.log(`Template: DEVQUERY`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return {
                success: true,
                message: 'Mock SMS sent (check console)',
            };
        }

        // Real mode - send Transactional SMS via 2Factor TSMS API
        // This endpoint does NOT support voice calls
        const apiUrl = `https://2factor.in/API/V1/${apiKey}/ADDON_SERVICES/SEND/TSMS`;

        const payload = {
            From: 'DEVQRY',           // Approved Sender ID (6 characters)
            To: `91${cleanPhone}`,    // Indian number (NO + sign)
            TemplateName: 'DEVQUERY', // Approved template name in 2Factor dashboard
            VAR1: otp,                // 4-digit OTP for #VAR1# placeholder
        };

        console.log(`📱 Sending Transactional SMS (TSMS) to +91${cleanPhone}...`);
        console.log(`   Language: ${targetLanguage}`);
        console.log(`   Sender: DEVQRY`);
        console.log(`   Template: DEVQUERY`);
        console.log(`   OTP: ${otp}`);
        console.log(`   Mode: SMS ONLY (NO voice calls possible)`);
        console.log(`   📦 Payload:`, JSON.stringify(payload, null, 2));

        const response = await axios.post(apiUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
        });

        console.log(`   📨 2Factor Response:`, JSON.stringify(response.data, null, 2));

        // Check response status
        if (response.data && response.data.Status === 'Success') {
            console.log(`✅ Transactional SMS sent successfully (NO voice call)`);
            console.log(`   Phone: +91${cleanPhone}`);
            console.log(`   Language: ${targetLanguage}`);
            console.log(`   OTP: ${otp}`);
            console.log(`   ⚠️ NO session ID (TSMS does not create sessions)`);

            return {
                success: true,
                message: 'OTP sent successfully via SMS',
            };
        } else {
            console.error('❌ 2Factor TSMS API returned error:', response.data);
            throw new Error(response.data.Details || 'Failed to send Transactional SMS');
        }

    } catch (error) {
        console.error('❌ Error sending Transactional SMS via 2Factor:', error.message);

        // Handle specific error cases
        if (error.response) {
            // API returned an error response
            console.error('   API Response:', error.response.data);
            throw new Error(error.response.data.Details || 'Failed to send SMS OTP');
        } else if (error.request) {
            // Request was made but no response received
            console.error('   No response from 2Factor TSMS API');
            throw new Error('SMS service unavailable. Please try again later.');
        } else {
            // Error in request setup
            throw new Error(error.message || 'Failed to send SMS OTP');
        }
    }
};

/**
 * Approved SMS Template (Configured in 2Factor Dashboard)
 * 
 * Template Name: DEVQUERY
 * Sender ID: DEVQRY
 * Template Text: Your DevQuery OTP is #VAR1#. Do not share this OTP.
 * 
 * Variables:
 * - #VAR1# = 4-digit OTP code
 * 
 * IMPORTANT:
 * - This template must be pre-approved in 2Factor dashboard
 * - Sender ID must be registered and approved
 * - TSMS endpoint does NOT support voice calls
 * - NO automatic fallback to voice
 */
