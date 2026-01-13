import admin from "firebase-admin";

/**
 * Firebase Admin SDK Service
 * Server-side verification of Firebase Phone Authentication
 * Used to verify Firebase UIDs before updating user language
 */

let firebaseAdmin;

/**
 * Initialize Firebase Admin SDK
 * Uses environment variables for configuration
 */
export const initializeFirebaseAdmin = () => {
    if (firebaseAdmin) {
        return firebaseAdmin;
    }

    try {
        // Check if Firebase Admin is already initialized
        if (admin.apps.length > 0) {
            firebaseAdmin = admin.apps[0];
            console.log("✅ Firebase Admin SDK already initialized");
            return firebaseAdmin;
        }

        // Initialize with service account credentials from environment
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

        if (!projectId || !clientEmail || !privateKey) {
            console.warn(
                "⚠️ Firebase Admin credentials not found in environment variables"
            );
            console.warn("Firebase UID verification will be skipped");
            return null;
        }

        firebaseAdmin = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });

        console.log("✅ Firebase Admin SDK initialized successfully");
        return firebaseAdmin;
    } catch (error) {
        console.error("❌ Error initializing Firebase Admin SDK:", error);
        return null;
    }
};

/**
 * Verify Firebase user UID
 * @param {string} uid - Firebase user UID
 * @returns {Promise<boolean>} True if UID is valid
 */
export const verifyFirebaseUID = async (uid) => {
    try {
        const app = initializeFirebaseAdmin();

        // If Firebase Admin is not initialized, skip verification
        // This allows the system to work without Firebase Admin SDK
        if (!app) {
            console.warn("⚠️ Firebase Admin not initialized, skipping UID verification");
            return true; // Allow operation to proceed
        }

        // Verify the UID exists in Firebase
        const userRecord = await admin.auth().getUser(uid);

        if (userRecord && userRecord.uid === uid) {
            console.log("✅ Firebase UID verified:", uid);
            return true;
        }

        return false;
    } catch (error) {
        console.error("❌ Error verifying Firebase UID:", error);

        // If error is "user not found", return false
        if (error.code === "auth/user-not-found") {
            return false;
        }

        // For other errors, log and return false
        return false;
    }
};

/**
 * Get Firebase user details
 * @param {string} uid - Firebase user UID
 * @returns {Promise<Object|null>} User record or null
 */
export const getFirebaseUser = async (uid) => {
    try {
        const app = initializeFirebaseAdmin();

        if (!app) {
            return null;
        }

        const userRecord = await admin.auth().getUser(uid);
        return userRecord;
    } catch (error) {
        console.error("Error getting Firebase user:", error);
        return null;
    }
};

// Initialize on module load
initializeFirebaseAdmin();
