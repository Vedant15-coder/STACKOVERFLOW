import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

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
 * Export Firebase Auth instance
 * Used for Phone Authentication
 */
export const auth: Auth = getAuth(app);

export default app;
