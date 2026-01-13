import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "../lib/axiosinstance";
import LanguageOTPModal from "./LanguageOTPModal";
import { ConfirmationResult } from "firebase/auth";
import { sendSMSOTP, cleanupRecaptcha } from "../services/firebaseSMSService";

interface LanguageSelectorProps {
    className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = "" }) => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [pendingLanguage, setPendingLanguage] = useState<string>(""); // Language waiting for OTP
    const [otpChannel, setOtpChannel] = useState<"email" | "mobile">("email");
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    // Firebase-specific state
    const [firebaseConfirmationResult, setFirebaseConfirmationResult] = useState<ConfirmationResult | undefined>();
    const [verificationMode, setVerificationMode] = useState<"firebase" | "backend">("backend");

    // Prevent hydration mismatch
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const languages = [
        { code: "en", name: "English", flag: "🇺🇸" },
        { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
        { code: "es", name: "Español", flag: "🇪🇸" },
        { code: "pt", name: "Português", flag: "🇵🇹" },
        { code: "fr", name: "Français", flag: "🇫🇷" },
        { code: "zh", name: "中文", flag: "🇨🇳" },
    ];

    // Current language is based on i18n.language (the ACTUAL applied language)
    const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

    /**
     * Apply language change - ONLY called after successful verification or for English
     */
    const applyLanguageChange = async (languageCode: string) => {
        try {
            await i18n.changeLanguage(languageCode);
            localStorage.setItem("language", languageCode);

            // Note: Backend language update happens during OTP verification
            // For non-logged-in users or English switch, only client-side change is needed
        } catch (error) {
            console.error("Error applying language change:", error);
        }
    };

    /**
     * Reset all OTP-related state (CRITICAL for preventing stale state bugs)
     */
    const resetOTPState = () => {
        setShowOTPModal(false);
        setShowPhoneModal(false);
        setPendingLanguage("");
        setOtpChannel("email");
        setPhoneNumber("");
        setPhoneError("");
        setFirebaseConfirmationResult(undefined);
        setVerificationMode("backend");
        cleanupRecaptcha(); // Clean up Firebase reCAPTCHA
    };

    /**
     * Validate Indian phone number
     */
    const validatePhoneNumber = (phone: string): boolean => {
        const cleaned = phone.replace(/[\s\-\(\)]/g, "");
        return /^[6-9]\d{9}$/.test(cleaned);
    };

    /**
     * Check if language requires SMS OTP (Spanish, Hindi, Portuguese, Chinese, English)
     */
    const requiresSMS = (languageCode: string): boolean => {
        return ["hi", "es", "pt", "zh", "en"].includes(languageCode);
    };

    const handleLanguageSelect = async (languageCode: string) => {
        console.log("🌍 handleLanguageSelect called");
        console.log("  - Selected language:", languageCode);
        console.log("  - Current language:", i18n.language);
        console.log("  - isProcessing:", isProcessing);

        setIsOpen(false);

        // If same as current language, do nothing
        if (languageCode === i18n.language) {
            console.log("⏭️ Same language, skipping");
            return;
        }

        // Prevent multiple simultaneous changes
        if (isProcessing) {
            console.log("⏭️ Already processing, skipping");
            return;
        }

        setIsProcessing(true);

        // CRITICAL: Reset all OTP state before every attempt
        resetOTPState();

        try {
            const token = localStorage.getItem("token");
            console.log("🔑 Token check:");
            console.log("  - Token exists:", !!token);
            console.log("  - Token value:", token ? token.substring(0, 20) + "..." : "null");

            // If not logged in, allow instant switch (no backend call needed)
            if (!token) {
                console.log("⚠️ No token found - applying language instantly");
                await applyLanguageChange(languageCode);
                setIsProcessing(false);
                return;
            }

            // For SMS languages, show phone number modal first
            if (requiresSMS(languageCode)) {
                console.log("📱 SMS language selected - showing phone number modal");
                setPendingLanguage(languageCode);
                setShowPhoneModal(true);
                setIsProcessing(false);
                return;
            }

            // For logged-in users: ALWAYS ask backend if OTP is required
            // Do NOT infer from languageCode - backend is single source of truth
            try {
                console.log("📡 Making API call to /api/language/request-otp");
                console.log("  - Target language:", languageCode);
                console.log("  - Token exists:", !!token);

                const response = await axios.post(
                    "/api/language/request-otp",
                    { targetLanguage: languageCode },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log("✅ API Response received:");
                console.log("  - Status:", response.status);
                console.log("  - Data:", response.data);
                console.log("  - requiresOTP:", response.data.requiresOTP);

                // Backend tells us if OTP is required
                if (response.data.requiresOTP) {
                    // Store pending language (NOT applied yet)
                    setPendingLanguage(languageCode);
                    setOtpChannel(response.data.channel || "email"); // 'sms' or 'email'
                    setShowOTPModal(true);

                    // DEBUG: Log state changes
                    console.log("🔴 OTP REQUIRED - Setting modal state:");
                    console.log("  - showOTPModal: true");
                    console.log("  - pendingLanguage:", languageCode);
                    console.log("  - otpType:", response.data.otpType);
                    console.log("  - Full response:", response.data);

                    // AGGRESSIVE DEBUG: Alert to confirm
                    alert(`DEBUG: OTP Required!\nLanguage: ${languageCode}\nType: ${response.data.otpType}`);

                    setIsProcessing(false);
                } else {
                    // No OTP required
                    await applyLanguageChange(languageCode);
                    setIsProcessing(false);
                }
            } catch (error: any) {
                console.error("Error requesting OTP:", error);
                console.log("Error status:", error.response?.status);
                console.log("Error message:", error.response?.data?.message);

                // If 401 Unauthorized, user's token is invalid/expired
                // Treat as non-logged-in user and allow instant switch
                if (error.response?.status === 401) {
                    console.log("Token expired or invalid, switching language without OTP");
                    await applyLanguageChange(languageCode);
                    setIsProcessing(false);
                } else if (error.response?.status === 404) {
                    // Route not found - this is a server configuration issue
                    alert("Language change feature is temporarily unavailable. Please try again later.");
                    setIsProcessing(false);
                } else {
                    alert(error.response?.data?.message || "Failed to request language change");
                    setIsProcessing(false);
                }
            }
        } catch (error) {
            console.error("Unexpected error in language selection:", error);
            setIsProcessing(false);
        }
    };

    /**
     * Handle phone number submission for SMS languages
     */
    const handlePhoneSubmit = async () => {
        // Validate phone number
        if (!validatePhoneNumber(phoneNumber)) {
            setPhoneError("Please enter a valid 10-digit Indian phone number (starting with 6-9)");
            return;
        }

        setPhoneError("");
        setIsProcessing(true);

        try {
            if (!pendingLanguage) {
                setIsProcessing(false);
                return;
            }

            console.log("📱 Sending Firebase SMS OTP to:", phoneNumber);

            // Send SMS OTP via Firebase (SMS-only, no voice calls)
            const confirmationResult = await sendSMSOTP(phoneNumber);

            console.log("✅ Firebase SMS sent successfully");

            // Store confirmation result for OTP verification
            setFirebaseConfirmationResult(confirmationResult);
            setVerificationMode("firebase");

            // Close phone modal, show OTP modal
            setShowPhoneModal(false);
            setOtpChannel("mobile");
            setShowOTPModal(true);
            setIsProcessing(false);
        } catch (error: any) {
            console.error("Error sending Firebase SMS OTP:", error);
            setPhoneError(error.message || "Failed to send OTP. Please try again.");
            setIsProcessing(false);
        }
    };

    /**
     * Called when OTP is successfully verified
     */
    const handleOTPVerified = async () => {
        if (!pendingLanguage) {
            console.error("No pending language to apply");
            setShowOTPModal(false);
            return;
        }

        // NOW apply the language change
        await applyLanguageChange(pendingLanguage);

        // Clean up
        setPendingLanguage("");
        setShowOTPModal(false);
    };

    /**
     * Called when user cancels OTP modal
     */
    const handleOTPCancel = () => {
        // Discard pending language
        setPendingLanguage("");
        setShowOTPModal(false);
    };

    // Prevent hydration mismatch - don't render until client-side
    if (!hasMounted) {
        return null;
    }

    return (
        <>
            <div className={`relative ${className}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-lg">{currentLanguage.flag}</span>
                    <span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
                    <svg
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                            <div className="px-4 py-2 border-b border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 uppercase">
                                    Select Language
                                </p>
                            </div>
                            <div className="py-1">
                                {languages.map((language) => (
                                    <button
                                        key={language.code}
                                        onClick={() => handleLanguageSelect(language.code)}
                                        disabled={isProcessing}
                                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${language.code === i18n.language
                                            ? "bg-blue-50 text-blue-600 font-medium"
                                            : "text-gray-700"
                                            }`}
                                    >
                                        <span className="text-lg">{language.flag}</span>
                                        <span className="flex-1 text-left">{language.name}</span>
                                        {language.code === i18n.language && (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Phone Number Modal for SMS languages */}
            {showPhoneModal && pendingLanguage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Enter Phone Number</h2>
                        <p className="text-gray-600 mb-4">
                            To change your language to{" "}
                            <strong>
                                {languages.find(l => l.code === pendingLanguage)?.name}
                            </strong>
                            , please enter your Indian phone number. You will receive an OTP via SMS.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => {
                                    setPhoneNumber(e.target.value);
                                    setPhoneError("");
                                }}
                                placeholder="9876543210"
                                maxLength={10}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Enter 10-digit Indian phone number (starting with 6-9)
                            </p>
                            {phoneError && (
                                <p className="text-sm text-red-600 mt-2">{phoneError}</p>
                            )}
                        </div>

                        {/* Invisible reCAPTCHA container for Firebase */}
                        <div id="recaptcha-container"></div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPhoneModal(false);
                                    setPendingLanguage("");
                                    setPhoneNumber("");
                                    setPhoneError("");
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePhoneSubmit}
                                disabled={isProcessing || !phoneNumber}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? "Sending..." : "Send OTP"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* OTP Modal - Rendered at ROOT level with fixed positioning */}
            {showOTPModal && pendingLanguage && (
                <LanguageOTPModal
                    targetLanguage={pendingLanguage}
                    channel={otpChannel}
                    onClose={handleOTPCancel}
                    onVerified={handleOTPVerified}
                    firebaseConfirmationResult={firebaseConfirmationResult}
                    verificationMode={verificationMode}
                />
            )}
        </>
    );
};

export default LanguageSelector;
