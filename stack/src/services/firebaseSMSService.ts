import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
    Auth,
} from "firebase/auth";
import { auth } from "../config/firebase.config";

/**
 * Firebase SMS OTP Service
 * Handles SMS-only OTP delivery via Firebase Phone Authentication
 * Zero voice-call fallback guaranteed by Firebase
 */

/**
 * Initialize invisible reCAPTCHA verifier
 * Required by Firebase for phone authentication
 * @param authInstance - Firebase Auth instance
 * @returns RecaptchaVerifier instance
 */
export const initializeRecaptcha = (authInstance: Auth): RecaptchaVerifier => {
    // Verify reCAPTCHA script is loaded
    if (typeof window !== 'undefined' && !(window as any).grecaptcha) {
        console.warn("⚠️ reCAPTCHA script not loaded yet. It should be loaded in _document.tsx");
        throw new Error("reCAPTCHA script not loaded. Please refresh the page and try again.");
    }

    // Clean up existing verifier if any
    if ((window as any).recaptchaVerifier) {
        try {
            (window as any).recaptchaVerifier.clear();
        } catch (error) {
            console.warn("Error clearing existing reCAPTCHA:", error);
        }
    }

    // Ensure the container exists
    const container = document.getElementById("recaptcha-container");
    if (!container) {
        console.error("❌ recaptcha-container element not found in DOM");
        throw new Error("reCAPTCHA container not found. Please refresh the page and try again.");
    }

    // Create new invisible reCAPTCHA verifier
    const recaptchaVerifier = new RecaptchaVerifier(
        authInstance,
        "recaptcha-container",
        {
            size: "invisible",
            callback: () => {
                console.log("✅ reCAPTCHA verified");
            },
            "expired-callback": () => {
                console.warn("⚠️ reCAPTCHA expired");
            },
        }
    );

    (window as any).recaptchaVerifier = recaptchaVerifier;
    return recaptchaVerifier;
};

/**
 * Send SMS OTP via Firebase Phone Authentication
 * SMS-only delivery, no voice calls possible
 * @param phoneNumber - 10-digit Indian phone number (without +91)
 * @returns ConfirmationResult for OTP verification
 */
export const sendSMSOTP = async (
    phoneNumber: string
): Promise<ConfirmationResult> => {
    try {
        // Validate phone number format
        const cleanedPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
        if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
            throw new Error(
                "Invalid phone number. Must be 10 digits starting with 6-9."
            );
        }

        // Format with +91 country code
        const formattedPhone = `+91${cleanedPhone}`;

        console.log(`📱 Sending SMS OTP to ${formattedPhone}`);

        // CRITICAL: Always clean up and create fresh reCAPTCHA for each attempt
        // Firebase reCAPTCHA can only be used once per instance
        cleanupRecaptcha();

        // Wait a bit for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create fresh reCAPTCHA verifier
        const recaptchaVerifier = initializeRecaptcha(auth);

        // Send SMS OTP via Firebase
        const confirmationResult = await signInWithPhoneNumber(
            auth,
            formattedPhone,
            recaptchaVerifier
        );

        console.log("✅ SMS OTP sent successfully via Firebase");
        return confirmationResult;
    } catch (error: any) {
        console.error("❌ Error sending SMS OTP:", error);

        // Handle specific Firebase errors
        if (error.code === "auth/invalid-phone-number") {
            throw new Error("Invalid phone number format");
        } else if (error.code === "auth/too-many-requests") {
            throw new Error(
                "Too many requests. Please try again later or use a different phone number."
            );
        } else if (error.code === "auth/quota-exceeded") {
            throw new Error(
                "SMS quota exceeded. Please contact support or try again later."
            );
        } else if (error.code === "auth/captcha-check-failed") {
            throw new Error("reCAPTCHA verification failed. Please try again.");
        } else {
            throw new Error(error.message || "Failed to send SMS OTP");
        }
    }
};

/**
 * Verify SMS OTP entered by user
 * @param confirmationResult - Result from sendSMSOTP
 * @param otp - 6-digit OTP entered by user
 * @returns Firebase user UID
 */
export const verifySMSOTP = async (
    confirmationResult: ConfirmationResult,
    otp: string
): Promise<string> => {
    try {
        // Validate OTP format
        if (!/^\d{6}$/.test(otp)) {
            throw new Error("Invalid OTP format. Must be 6 digits.");
        }

        console.log("🔐 Verifying SMS OTP...");

        // Verify OTP with Firebase
        const result = await confirmationResult.confirm(otp);

        console.log("✅ SMS OTP verified successfully");
        console.log("Firebase UID:", result.user.uid);

        return result.user.uid;
    } catch (error: any) {
        console.error("❌ Error verifying SMS OTP:", error);

        // Handle specific Firebase errors
        if (error.code === "auth/invalid-verification-code") {
            throw new Error("Invalid OTP. Please check and try again.");
        } else if (error.code === "auth/code-expired") {
            throw new Error("OTP has expired. Please request a new one.");
        } else {
            throw new Error(error.message || "Failed to verify OTP");
        }
    }
};

/**
 * Clean up reCAPTCHA resources
 * Call this when component unmounts or modal closes
 */
export const cleanupRecaptcha = (): void => {
    try {
        if ((window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier.clear();
            (window as any).recaptchaVerifier = null;
            console.log("🧹 reCAPTCHA cleaned up");
        }
    } catch (error) {
        console.warn("Error cleaning up reCAPTCHA:", error);
    }
};
