/**
 * Phone Number Validation Utility
 * Validates and sanitizes Indian phone numbers
 */

/**
 * Validate Indian phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid 10-digit Indian number
 */
export const isValidIndianPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return false;

    // Remove any spaces, dashes, or special characters
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Must be exactly 10 digits, starting with 6-9
    return /^[6-9]\d{9}$/.test(cleaned);
};

/**
 * Sanitize phone number (remove spaces, dashes, etc.)
 * @param {string} phoneNumber - Phone number to sanitize
 * @returns {string} Cleaned phone number
 */
export const sanitizePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    return phoneNumber.replace(/[\s\-\(\)]/g, '');
};

/**
 * Format phone number for display
 * @param {string} phoneNumber - 10-digit phone number
 * @returns {string} Formatted as XXX-XXX-XXXX
 */
export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length !== 10) return phoneNumber;
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
};
