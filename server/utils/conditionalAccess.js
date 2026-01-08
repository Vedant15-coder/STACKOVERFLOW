/**
 * Conditional Access Control Rules
 * Implements business logic for login access based on device, browser, and time
 */

/**
 * Check if the device/browser requires OTP verification
 * Rule: Chrome on Desktop/Laptop requires Email OTP
 * @param {Object} deviceInfo - Device information from parseUserAgent
 * @returns {boolean} True if OTP is required
 */
export const shouldRequireOTP = (deviceInfo) => {
    const { browser, deviceType } = deviceInfo;

    // Rule A: Chrome on Desktop or Laptop requires OTP
    const isChrome = browser?.toLowerCase().includes("chrome") &&
        !browser?.toLowerCase().includes("edge"); // Exclude Edge (Chromium-based)

    const isDesktopOrLaptop = deviceType === "Desktop" || deviceType === "Laptop";

    return isChrome && isDesktopOrLaptop;
};

/**
 * Check if mobile access is allowed based on current time (IST)
 * Rule: Mobile devices can only access between 10:00 AM - 1:00 PM IST
 * @param {Object} deviceInfo - Device information
 * @returns {Object} { allowed: boolean, reason?: string }
 */
export const isMobileAccessAllowed = (deviceInfo) => {
    const { isMobile, deviceType } = deviceInfo;

    // Only apply time restriction to mobile devices
    if (!isMobile && deviceType !== "Mobile") {
        return { allowed: true };
    }

    // Get current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istTime = new Date(now.getTime() + istOffset);

    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();

    // Convert to minutes since midnight for easier comparison
    const currentMinutes = hours * 60 + minutes;
    const startMinutes = 10 * 60; // 10:00 AM
    const endMinutes = 13 * 60;   // 1:00 PM

    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return { allowed: true };
    }

    return {
        allowed: false,
        reason: "Mobile access is only allowed between 10:00 AM - 1:00 PM IST",
    };
};

/**
 * Check if the browser is Microsoft Edge
 * Rule: Edge allows direct login without OTP
 * @param {Object} deviceInfo - Device information
 * @returns {boolean} True if browser is Edge
 */
export const isEdgeBrowser = (deviceInfo) => {
    const { browser } = deviceInfo;
    return browser?.toLowerCase().includes("edge");
};

/**
 * Determine the login method based on device info and OTP verification status
 * @param {Object} deviceInfo - Device information
 * @param {boolean} otpVerified - Whether OTP was verified
 * @returns {string} Login method: "Password", "Email OTP", or "Bypassed"
 */
export const determineLoginMethod = (deviceInfo, otpVerified = false) => {
    if (shouldRequireOTP(deviceInfo)) {
        return otpVerified ? "Email OTP" : "Password";
    }

    if (isEdgeBrowser(deviceInfo)) {
        return "Bypassed";
    }

    return "Password";
};

/**
 * Evaluate all conditional access rules
 * @param {Object} deviceInfo - Device information
 * @returns {Object} { allowed: boolean, requiresOTP: boolean, reason?: string }
 */
export const evaluateAccessRules = (deviceInfo) => {
    // Check mobile time restriction first
    const mobileCheck = isMobileAccessAllowed(deviceInfo);
    if (!mobileCheck.allowed) {
        return {
            allowed: false,
            requiresOTP: false,
            reason: mobileCheck.reason,
        };
    }

    // Check if OTP is required
    const requiresOTP = shouldRequireOTP(deviceInfo);

    return {
        allowed: true,
        requiresOTP,
    };
};
