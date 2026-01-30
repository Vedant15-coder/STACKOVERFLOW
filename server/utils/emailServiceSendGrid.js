// emailServiceSendGrid.js – SendGrid HTTP API for Railway compatibility
// Uses HTTP API instead of SMTP to bypass Railway port restrictions

import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const initializeSendGrid = () => {
    const apiKey = process.env.SENDGRID_API_KEY || process.env.EMAIL_PASSWORD;
    if (!apiKey) {
        throw new Error('SendGrid API key not found in environment variables');
    }
    sgMail.setApiKey(apiKey);
};

/**
 * Send password reset email (used by Forgot‑Password feature)
 */
export const sendPasswordEmail = async (email, password) => {
    try {
        if (process.env.OTP_MODE === 'mock') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 [MOCK MODE] Password Reset Email');
            console.log(`To: ${email}`);
            console.log(`New Password: ${password}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return { success: true };
        }

        initializeSendGrid();

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM || 'DevQuery <no-reply@devquery.com>',
            subject: 'Password Reset – DevQuery',
            html: `<h2>Password Reset Request</h2>
            <p>Your new password is: <strong>${password}</strong></p>
            <p>Please log in and change it immediately.</p>
            <p>If you did not request this, contact support.</p>`,
        };

        await sgMail.send(msg);
        console.log(`✅ Password reset email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending password reset email:', error.response?.body || error);
        return { success: false, message: 'Failed to send email. Please try again later.' };
    }
};

/** Validate email format */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Send subscription invoice email
 */
export const sendInvoiceEmail = async (email, invoiceData) => {
    try {
        const { userName, plan, amount, invoiceId, startDate, expiryDate } = invoiceData;
        const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata',
        });

        // Get question limit for the plan
        const questionLimits = {
            'BRONZE': '5 questions per day',
            'SILVER': '10 questions per day',
            'GOLD': 'Unlimited questions per day'
        };
        const questionLimit = questionLimits[plan] || 'N/A';

        // In development mode, log to console
        if (process.env.NODE_ENV === 'development') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 [DEV MODE] Subscription Invoice Email');
            console.log(`To: ${email}`);
            console.log(`User: ${userName}`);
            console.log(`Plan: ${plan}`);
            console.log(`Amount: ₹${amount}`);
            console.log(`Invoice ID: ${invoiceId}`);
            console.log(`Start Date: ${formatDate(startDate)}`);
            console.log(`Expiry Date: ${formatDate(expiryDate)}`);
            console.log(`Daily Limit: ${questionLimit}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }

        // Always send email (both dev and production)
        initializeSendGrid();

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM || 'DevQuery <no-reply@devquery.com>',
            subject: `DevQuery Subscription Invoice – ${invoiceId}`,
            html: `<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">Subscription Invoice</h2>
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Thank you for subscribing to DevQuery! Your payment has been successfully processed.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0066cc;">Subscription Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Plan:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${plan}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Amount Paid:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">₹${amount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Invoice ID:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${invoiceId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Start Date:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${formatDate(startDate)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Expiry Date:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${formatDate(expiryDate)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Daily Question Limit:</strong></td>
                <td style="padding: 8px 0; color: #0066cc; font-weight: bold;">${questionLimit}</td>
              </tr>
            </table>
          </div>

          <div style="background: #e8f4f8; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0;">
            <p style="margin: 0;"><strong>🎉 Your subscription is now active!</strong></p>
            <p style="margin: 5px 0 0 0;">You can now enjoy ${questionLimit.toLowerCase()} on DevQuery.</p>
          </div>

          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p style="margin-top: 30px;">Best regards,<br><strong>The DevQuery Team</strong></p>
        </div>
      </body></html>`,
        };

        await sgMail.send(msg);
        console.log(`✅ Invoice email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending invoice email:', error.response?.body || error);
        return { success: false, message: 'Failed to send invoice email. Please contact support.' };
    }
};

/**
 * Send language change OTP email
 */
export const sendLanguageOTP = async (email, otp, targetLanguage) => {
    try {
        const languageName = targetLanguage === 'fr' ? 'French' : targetLanguage;
        if (process.env.OTP_MODE === 'mock') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 [MOCK MODE] Language Change OTP');
            console.log(`To: ${email}`);
            console.log(`Target Language: ${languageName}`);
            console.log(`🔐 OTP: ${otp}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return { success: true };
        }

        initializeSendGrid();

        // Use verified sender email explicitly
        const fromEmail = process.env.EMAIL_FROM || 'kondvilkarvedant@gmail.com';

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM || 'kondvilkarvedant@gmail.com',
            subject: 'DevQuery Language Change Verification',
            text: `Your DevQuery language change verification code is: ${otp}. Valid for 5 minutes.`,
            html: `<html><body>
        <h2>Language Change Verification</h2>
        <p>You requested to change your interface language to <strong>${languageName}</strong>.</p>
        <div style="background:#f5f5f5;padding:20px;margin:20px 0;border:2px solid #0066cc;border-radius:8px;text-align:center;">
          <p>Your verification code is:</p>
          <h1 style="font-size:32px;color:#0066cc;letter-spacing:8px;">${otp}</h1>
          <p style="color:#666;font-size:14px;">Valid for 5 minutes</p>
        </div>
        <p><strong>⚠️ Security Notice:</strong></p>
        <ul>
          <li>Never share this code with anyone.</li>
          <li>DevQuery will never ask for this code via phone or chat.</li>
          <li>If you didn't request this change, ignore this email.</li>
        </ul>
        <p>— The DevQuery Team</p>
      </body></html>`,
            mailSettings: {
                sandboxMode: {
                    enable: false
                }
            },
            trackingSettings: {
                clickTracking: {
                    enable: false
                },
                openTracking: {
                    enable: false
                }
            }
        };

        console.log(`📧 Sending language OTP email to ${email}...`);
        const response = await sgMail.send(msg);
        console.log(`✅ SendGrid response:`, response[0].statusCode, response[0].headers);
        console.log(`✅ Language OTP email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending language OTP email:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.statusCode);
            console.error('Response body:', JSON.stringify(error.response.body, null, 2));
        }
        return { success: false, message: 'Failed to send OTP email. Please try again later.' };
    }
};

/**
 * Send login verification OTP email
 */
export const sendLoginOTP = async (email, otp, browser = 'Chrome', os = 'Unknown') => {
    try {
        if (process.env.OTP_MODE === 'mock') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 [MOCK MODE] Login Verification OTP');
            console.log(`To: ${email}`);
            console.log(`Browser: ${browser}`);
            console.log(`OS: ${os}`);
            console.log(`🔐 OTP: ${otp}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return { success: true };
        }

        initializeSendGrid();

        // Use verified sender email explicitly
        const fromEmail = process.env.EMAIL_FROM || 'kondvilkarvedant@gmail.com';

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM || 'kondvilkarvedant@gmail.com',
            subject: 'DevQuery Login Verification',
            text: `Your DevQuery login verification code is: ${otp}. Valid for 5 minutes. Login detected from ${browser} on ${os}.`,
            html: `<html><body>
        <h2>Login Verification</h2>
        <p>A login attempt was detected from <strong>${browser}</strong> on <strong>${os}</strong>.</p>
        <div style="background:#f5f5f5;padding:20px;margin:20px 0;border:2px solid #0066cc;border-radius:8px;text-align:center;">
          <p>Your verification code is:</p>
          <h1 style="font-size:32px;color:#0066cc;letter-spacing:8px;">${otp}</h1>
          <p style="color:#666;font-size:14px;">Valid for 5 minutes</p>
        </div>
        <p><strong>⚠️ Security Notice:</strong></p>
        <ul>
          <li>Never share this code with anyone.</li>
          <li>DevQuery will never ask for this code via phone or chat.</li>
          <li>If you didn't attempt to log in, secure your account immediately.</li>
        </ul>
        <p>— The DevQuery Team</p>
      </body></html>`,
            mailSettings: {
                sandboxMode: {
                    enable: false
                }
            },
            trackingSettings: {
                clickTracking: {
                    enable: false
                },
                openTracking: {
                    enable: false
                }
            }
        };

        console.log(`📧 Sending login OTP email to ${email}...`);
        const response = await sgMail.send(msg);
        console.log(`✅ SendGrid response:`, response[0].statusCode, response[0].headers);
        console.log(`✅ Login OTP email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending login OTP email:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.statusCode);
            console.error('Response body:', JSON.stringify(error.response.body, null, 2));
        }
        return { success: false, message: 'Failed to send OTP email. Please try again later.' };
    }
};
