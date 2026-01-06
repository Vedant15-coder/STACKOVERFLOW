/**
 * Email Service for Forgot Password Feature
 * 
 * Sends password reset emails to users
 * For v1: Email only (phone number support can be added later)
 * 
 * SECURITY:
 * - Only logs password in development mode
 * - Never logs passwords in production
 * - Clean error handling
 */

/**
 * Send password reset email to user
 * @param {string} email - User's email address
 * @param {string} password - New generated password
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const sendPasswordEmail = async (email, password) => {
    try {
        // Development mode: Log to console for testing
        if (process.env.NODE_ENV === 'development') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 [DEV MODE] Password Reset Email');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`To: ${email}`);
            console.log(`New Password: ${password}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return { success: true };
        }

        // Production mode: Integrate with actual email service
        // TODO: Replace with actual email service (SendGrid, Nodemailer, AWS SES, etc.)

        /*
        Example with Nodemailer:
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset - DevQuery',
            html: `
                <h2>Password Reset Request</h2>
                <p>Your new password is: <strong>${password}</strong></p>
                <p>Please login with this password and change it immediately.</p>
                <p>If you didn't request this, please contact support.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        */

        // For now, mock success in production
        console.log(`[PRODUCTION] Password reset email would be sent to: ${email}`);
        return { success: true };

    } catch (error) {
        console.error('Error sending password reset email:', error);
        return {
            success: false,
            message: 'Failed to send email. Please try again later.'
        };
    }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Send subscription invoice email to user
 * @param {string} email - User's email address
 * @param {Object} invoiceData - Invoice details
 * @param {string} invoiceData.userName - User's name
 * @param {string} invoiceData.plan - Subscription plan (BRONZE/SILVER/GOLD)
 * @param {number} invoiceData.amount - Amount paid
 * @param {string} invoiceData.invoiceId - Unique invoice ID
 * @param {Date} invoiceData.startDate - Subscription start date
 * @param {Date} invoiceData.expiryDate - Subscription expiry date
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const sendInvoiceEmail = async (email, invoiceData) => {
    try {
        const {
            userName,
            plan,
            amount,
            invoiceId,
            startDate,
            expiryDate
        } = invoiceData;

        // Format dates for display
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'Asia/Kolkata'
            });
        };

        // Development mode: Log to console for testing
        if (process.env.NODE_ENV === 'development') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 [DEV MODE] Subscription Invoice Email');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`To: ${email}`);
            console.log(`User: ${userName}`);
            console.log(`Plan: ${plan}`);
            console.log(`Amount: ₹${amount}`);
            console.log(`Invoice ID: ${invoiceId}`);
            console.log(`Start Date: ${formatDate(startDate)}`);
            console.log(`Expiry Date: ${formatDate(expiryDate)}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return { success: true };
        }

        // Production mode: Integrate with actual email service
        // TODO: Replace with actual email service (SendGrid, Nodemailer, AWS SES, etc.)

        /*
        Example with Nodemailer:
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `DevQuery Subscription Invoice - ${invoiceId}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 20px; }
                        .invoice-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0066cc; }
                        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                        .detail-label { font-weight: bold; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                        .amount { font-size: 24px; color: #0066cc; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>DevQuery Subscription Invoice</h1>
                        </div>
                        <div class="content">
                            <p>Dear ${userName},</p>
                            <p>Thank you for subscribing to DevQuery! Your payment has been successfully processed.</p>
                            
                            <div class="invoice-details">
                                <h2>Invoice Details</h2>
                                <div class="detail-row">
                                    <span class="detail-label">Invoice ID:</span>
                                    <span>${invoiceId}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Plan:</span>
                                    <span>${plan}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Amount Paid:</span>
                                    <span class="amount">₹${amount}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Subscription Start:</span>
                                    <span>${formatDate(startDate)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Subscription Expiry:</span>
                                    <span>${formatDate(expiryDate)}</span>
                                </div>
                            </div>

                            <div class="invoice-details">
                                <h3>Your Benefits</h3>
                                <p>With your ${plan} plan, you can now post <strong>${plan === 'GOLD' ? 'unlimited' : plan === 'SILVER' ? '10' : '5'} questions per day</strong>!</p>
                            </div>

                            <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
                            <p>Happy coding!</p>
                            <p><strong>The DevQuery Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>&copy; ${new Date().getFullYear()} DevQuery. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        */

        // For now, mock success in production
        console.log(`[PRODUCTION] Invoice email would be sent to: ${email}`);
        console.log(`Invoice ID: ${invoiceId}, Plan: ${plan}, Amount: ₹${amount}`);
        return { success: true };

    } catch (error) {
        console.error('Error sending invoice email:', error);
        return {
            success: false,
            message: 'Failed to send invoice email. Please contact support.'
        };
    }
};

/**
 * Send language change OTP email to user (for French language)
 * @param {string} email - User's email address
 * @param {string} otp - 6-digit OTP
 * @param {string} targetLanguage - Language user is switching to (should be 'fr')
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const sendLanguageOTP = async (email, otp, targetLanguage) => {
    try {
        const languageName = "French";

        // Development mode: Log to console for testing
        if (process.env.NODE_ENV === 'development') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 [DEV MODE] Language Change OTP Email');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`To: ${email}`);
            console.log(`Target Language: ${languageName}`);
            console.log(`OTP: ${otp}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return { success: true };
        }

        // Production mode: Integrate with actual email service
        // TODO: Replace with actual email service (SendGrid, Nodemailer, AWS SES, etc.)

        /*
        Example with Nodemailer:
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'DevQuery Language Change Verification',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 20px; }
                        .otp-box { background: white; padding: 20px; margin: 20px 0; text-align: center; border: 2px solid #0066cc; border-radius: 8px; }
                        .otp-code { font-size: 32px; font-weight: bold; color: #0066cc; letter-spacing: 8px; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Language Change Verification</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>You have requested to change your DevQuery interface language to <strong>${languageName}</strong>.</p>
                            
                            <div class="otp-box">
                                <p>Your verification code is:</p>
                                <div class="otp-code">${otp}</div>
                                <p style="color: #666; font-size: 14px; margin-top: 10px;">Valid for 5 minutes</p>
                            </div>

                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong>
                                <ul style="margin: 5px 0; padding-left: 20px;">
                                    <li>Never share this code with anyone</li>
                                    <li>DevQuery will never ask for this code via phone or chat</li>
                                    <li>If you didn't request this change, please ignore this email</li>
                                </ul>
                            </div>

                            <p>If you have any questions, please contact our support team.</p>
                            <p><strong>The DevQuery Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>&copy; ${new Date().getFullYear()} DevQuery. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        */

        // For now, mock success in production
        console.log(`[PRODUCTION] Language OTP email would be sent to: ${email}`);
        console.log(`OTP: ${otp}, Target Language: ${languageName}`);
        return { success: true };

    } catch (error) {
        console.error('Error sending language OTP email:', error);
        return {
            success: false,
            message: 'Failed to send OTP email. Please try again later.'
        };
    }
};


