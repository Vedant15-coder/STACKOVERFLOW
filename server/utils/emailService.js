// emailService.js – Production‑ready OTP & email utilities

import nodemailer from 'nodemailer';

// Helper to create a transporter; throws if required env vars are missing
const createTransporter = () => {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM } = process.env;
    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD || !EMAIL_FROM) {
        throw new Error('Missing required email configuration environment variables.');
    }
    return nodemailer.createTransport({
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT),
        secure: Number(EMAIL_PORT) === 465, // true for 465, false for other ports
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD,
        },
    });
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

        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Password Reset – DevQuery',
            html: `<h2>Password Reset Request</h2>
            <p>Your new password is: <strong>${password}</strong></p>
            <p>Please log in and change it immediately.</p>
            <p>If you did not request this, contact support.</p>`,
        };
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending password reset email:', error);
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
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return { success: true };
        }

        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `DevQuery Subscription Invoice – ${invoiceId}`,
            html: `<html><body>
        <h2>Subscription Invoice</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for subscribing to DevQuery! Here are your details:</p>
        <ul>
          <li>Plan: ${plan}</li>
          <li>Amount Paid: ₹${amount}</li>
          <li>Invoice ID: ${invoiceId}</li>
          <li>Start Date: ${formatDate(startDate)}</li>
          <li>Expiry Date: ${formatDate(expiryDate)}</li>
        </ul>
        <p>Enjoy your benefits!</p>
        <p>— The DevQuery Team</p>
      </body></html>`,
        };
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending invoice email:', error);
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

        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'DevQuery Language Change Verification',
            html: `<html><body>
        <h2>Language Change Verification</h2>
        <p>You requested to change your interface language to <strong>${languageName}</strong>.</p>
        <div style="background:#fff;padding:20px;margin:20px 0;border:2px solid #0066cc;border-radius:8px;text-align:center;">
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
        };
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending language OTP email:', error);
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

        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'DevQuery Login Verification',
            html: `<html><body>
        <h2>Login Verification</h2>
        <p>A login attempt was detected from <strong>${browser}</strong> on <strong>${os}</strong>.</p>
        <div style="background:#fff;padding:20px;margin:20px 0;border:2px solid #0066cc;border-radius:8px;text-align:center;">
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
        };
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending login OTP email:', error);
        return { success: false, message: 'Failed to send OTP email. Please try again later.' };
    }
};
