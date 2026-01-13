import axios from 'axios';

/**
 * 2Factor.in SMS Service with Template Support
 * 
 * Using SMS endpoint with template name for DLT compliance
 * This approach uses the standard SMS API with template parameter
 * 
 * API Documentation: https://2factor.in/docs/
 */

/**
 * Send SMS OTP using 2Factor.in SMS API with Template
 * @param {string} phoneNumber - 10-digit Indian mobile number
 * @param {string} otp - 4-digit OTP code
 * @param {string} targetLanguage - Target language code (for logging)
 * @returns {Promise<{success: boolean, message?: string, sessionId?: string}>}
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
            console.log('📱 [MOCK MODE] 2Factor SMS with Template');
            console.log(`Phone: +91${cleanPhone}`);
            console.log(`Language: ${targetLanguage}`);
            console.log(`🔐 OTP: ${otp}`);
            console.log(`Template: DEVQUERY`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return {
                success: true,
                message: 'Mock SMS sent (check console)',
                sessionId: 'mock-session-' + Date.now(),
            };
        }

        // Real mode - Send SMS with template name
        // Format: /API/V1/{API_KEY}/SMS/{phone}/{otp}/{template_name}
        const apiUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${cleanPhone}/${otp}/DEVQUERY`;

        console.log(`📱 Sending SMS with Template to +91${cleanPhone}...`);
        console.log(`   Language: ${targetLanguage}`);
        console.log(`   Template: DEVQUERY`);
        console.log(`   OTP: ${otp}`);
        console.log(`   Endpoint: /SMS/{phone}/{otp}/DEVQUERY`);

        const response = await axios.get(apiUrl, {
            timeout: 10000, // 10 second timeout
        });

        console.log(`   📨 2Factor Response:`, JSON.stringify(response.data, null, 2));

        // Check response status
        if (response.data && response.data.Status === 'Success') {
            console.log(`✅ SMS sent successfully with template`);
            console.log(`   Phone: +91${cleanPhone}`);
            console.log(`   Language: ${targetLanguage}`);
            console.log(`   Session ID: ${response.data.Details}`);

            return {
                success: true,
                message: 'OTP sent successfully via SMS',
                sessionId: response.data.Details,
            };
        } else {
            console.error('❌ 2Factor API returned error:', response.data);
            throw new Error(response.data.Details || 'Failed to send SMS');
        }

    } catch (error) {
        console.error('❌ Error sending SMS via 2Factor:', error.message);

        // Handle specific error cases
        if (error.response) {
            // API returned an error response
            console.error('   API Response:', error.response.data);
            throw new Error(error.response.data.Details || 'Failed to send SMS OTP');
        } else if (error.request) {
            // Request was made but no response received
            console.error('   No response from 2Factor API');
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
 * Sender ID: DEVQRY (configured in 2Factor dashboard)
 * Template Text: Your DevQuery OTP is #VAR1#. Do not share this OTP.
 * 
 * API Format: /SMS/{phone}/{otp}/DEVQUERY
 * The template name is passed as the last parameter in the URL
 * 2Factor automatically replaces #VAR1# with the OTP value
 */
