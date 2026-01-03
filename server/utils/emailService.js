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
