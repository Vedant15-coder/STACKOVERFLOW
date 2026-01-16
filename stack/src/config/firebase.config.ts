import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

/**
 * Firebase Configuration for DevQuery Language OTP
 * Project: devquery-language-otp
 * Purpose: SMS-only OTP verification for language switching
 */

const firebaseConfig = {
    apiKey: "AIzaSyBTePhfoMuUXjIEXJBMHuqkBhzSXwTye-Y",
    authDomain: "devquery-language-otp.firebaseapp.com",
    projectId: "devquery-language-otp",
    storageBucket: "devquery-language-otp.firebasestorage.app",
    messagingSenderId: "163343724718",
    appId: "1:163343724718:web:259bd27914925f58e1bd3f",
};

/**
 * Initialize Firebase App
 * Prevents multiple initializations
 */
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

/**
 * Initialize Firebase App Check with reCAPTCHA Enterprise
 * Required for Phone Authentication to work with App Check enforcement
 */
if (typeof window !== 'undefined') {
    try {
        initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider('6Lf9tEwsAAAAADkEBvg29wRSLemYVZlrxR579Rbe'),
            isTokenAutoRefreshEnabled: true // Automatically refresh tokens
        });
        console.log("✅ Firebase App Check initialized with reCAPTCHA Enterprise");
    } catch (error) {
        console.warn("⚠️ App Check initialization error (may already be initialized):", error);
    }
}

/**
 * Export Firebase Auth instance
 * Used for Phone Authentication
 */
export const auth: Auth = getAuth(app);

export default app;

