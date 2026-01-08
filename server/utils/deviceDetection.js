import { UAParser } from "ua-parser-js";

/**
 * Parse user agent string to extract browser, OS, and device information
 * @param {string} userAgent - User agent string from request headers
 * @returns {Object} Parsed device information
 */
export const parseUserAgent = (userAgent) => {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
        browser: result.browser.name || "Unknown",
        browserVersion: result.browser.version || "Unknown",
        os: result.os.name || "Unknown",
        osVersion: result.os.version || "Unknown",
        deviceType: determineDeviceType(result),
        deviceModel: result.device.model || "Unknown",
        isMobile: result.device.type === "mobile" || result.device.type === "tablet",
    };
};

/**
 * Determine device type from parsed UA result
 * @param {Object} result - UAParser result object
 * @returns {string} Device type
 */
const determineDeviceType = (result) => {
    const deviceType = result.device.type;

    if (deviceType === "mobile") return "Mobile";
    if (deviceType === "tablet") return "Tablet";

    // If no device type, assume desktop/laptop based on OS
    const os = result.os.name?.toLowerCase() || "";
    if (os.includes("windows") || os.includes("mac") || os.includes("linux")) {
        return "Desktop";
    }

    return "127.0.0.1";
};

/**
 * Extract IP address from request, handling proxies and CDNs
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
export const extractIPAddress = (req) => {
    // Check for forwarded IP (from proxy/CDN)
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return forwarded.split(",")[0].trim();
    }

    // Check for real IP header (some proxies use this)
    const realIP = req.headers["x-real-ip"];
    if (realIP) {
        return realIP;
    }

    // Fallback to connection remote address
    return req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        "127.0.0.1";
};

/**
 * Get complete device information from request
 * @param {Object} req - Express request object
 * @returns {Object} Complete device and network information
 */
export const getDeviceInfo = (req) => {
    try {
        const userAgent = req.headers["user-agent"] || "";
        const deviceInfo = parseUserAgent(userAgent);
        const ipAddress = extractIPAddress(req);

        return {
            ...deviceInfo,
            ipAddress,
            platform: "Web",
        };
    } catch (error) {
        console.error("Error in getDeviceInfo:", error);
        // Return safe defaults if anything fails
        return {
            browser: "Unknown",
            browserVersion: "Unknown",
            os: "Unknown",
            osVersion: "Unknown",
            deviceType: "Unknown",
            deviceModel: "Unknown",
            isMobile: false,
            ipAddress: "127.0.0.1",
            platform: "Web",
        };
    }
};

/**
 * Mask IP address for privacy (show only last octet)
 * @param {string} ip - IP address to mask
 * @returns {string} Masked IP address
 */
export const maskIPAddress = (ip) => {
    if (!ip || typeof ip !== 'string') return "xxx.xxx.xxx.xxx";
    if (ip === "127.0.0.1" || ip === "::1") return "localhost";

    // Handle IPv4
    if (ip.includes(".")) {
        const parts = ip.split(".");
        if (parts.length === 4) {
            return `xxx.xxx.xxx.${parts[3]}`;
        }
    }

    // Handle IPv6 - show last segment
    if (ip.includes(":")) {
        const parts = ip.split(":");
        const lastSegment = parts[parts.length - 1];
        return `xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:${lastSegment}`;
    }

    return "xxx.xxx.xxx.xxx";
};

