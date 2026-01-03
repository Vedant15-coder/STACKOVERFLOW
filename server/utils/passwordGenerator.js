/**
 * Custom Password Generator for Forgot Password Feature
 * 
 * Requirements:
 * - Length: 8-10 characters (random)
 * - Only uppercase (A-Z) and lowercase (a-z) letters
 * - NO numbers or special characters
 * - Must include at least one uppercase AND one lowercase letter
 * 
 * @returns {string} Generated password (e.g., "AbCdEfGh", "QrTaWeYu")
 */
export const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';

    // Random length between 8-10
    const length = Math.floor(Math.random() * 3) + 8;

    let password = '';
    let hasUpper = false;
    let hasLower = false;

    // Loop ensures at least one uppercase and one lowercase character
    // If we reach the length without both, we restart to guarantee requirements
    while (password.length < length || !hasUpper || !hasLower) {
        const useUpper = Math.random() > 0.5;
        const char = useUpper
            ? uppercase[Math.floor(Math.random() * uppercase.length)]
            : lowercase[Math.floor(Math.random() * lowercase.length)];

        password += char;

        if (useUpper) hasUpper = true;
        else hasLower = true;

        // Reset if we exceeded length without meeting requirements
        if (password.length > length) {
            password = '';
            hasUpper = false;
            hasLower = false;
        }
    }

    return password;
};

/**
 * Validate password meets requirements (for testing)
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid
 */
export const validatePassword = (password) => {
    if (password.length < 8 || password.length > 10) return false;

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasInvalid = /[^A-Za-z]/.test(password);

    return hasUpper && hasLower && !hasInvalid;
};
