import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import axios from "../lib/axiosinstance";

interface LanguageOTPModalProps {
    targetLanguage: string;
    channel: "email" | "mobile";
    onClose: () => void;
    onVerified: () => void;
}

const LanguageOTPModal: React.FC<LanguageOTPModalProps> = ({
    targetLanguage,
    channel,
    onClose,
    onVerified,
}) => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState<string[]>(["", "", "", ""]); // 4-digit OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [shake, setShake] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const languageNames: Record<string, string> = {
        en: t("language.english"),
        hi: t("language.hindi"),
        es: t("language.spanish"),
        pt: t("language.portuguese"),
        fr: t("language.french"),
        zh: t("language.chinese"),
    };

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Auto-focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError(""); // Clear error on input

        // Auto-advance to next input
        if (value && index < 3) { // Changed from 5 to 3
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        // Handle paste
        if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then((text) => {
                const digits = text.replace(/\D/g, "").slice(0, 4).split(""); // Changed from 6 to 4
                const newOtp = [...otp];
                digits.forEach((digit, i) => {
                    if (i < 4) newOtp[i] = digit; // Changed from 6 to 4
                });
                setOtp(newOtp);
                inputRefs.current[Math.min(digits.length, 3)]?.focus(); // Changed from 5 to 3
            });
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join("");
        if (otpString.length !== 4) { // Changed from 6 to 4
            setError("Please enter all 4 digits"); // Changed from 6 to 4
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "/api/language/verify-otp",
                { otp: otpString },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onVerified();
                }, 800); // Smooth transition
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid OTP. Please try again.");
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setOtp(["", "", "", ""]); // Changed from 6 to 4
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setError("");
        setOtp(["", "", "", ""]); // Changed from 6 to 4

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "/api/language/request-otp",
                { targetLanguage },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setTimeLeft(300); // Reset timer
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    const isOtpComplete = otp.every((digit) => digit !== "");

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                                Verification Required
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="text-lg">🔐</span>
                                <span>Confirm language change to {languageNames[targetLanguage]}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-5">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">
                                {channel === "email" ? "📧" : "📱"}
                            </span>
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    We've sent a 4-digit OTP to your {channel === "email" ? "email address" : "phone number"}
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    Please enter the code below to continue
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* OTP Input - 6 Separate Boxes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Enter Verification Code
                        </label>
                        <div className={`flex gap-2 justify-center ${shake ? "animate-shake" : ""}`}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    disabled={loading || timeLeft <= 0 || success}
                                    className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all
                                        ${digit ? "border-blue-500 bg-blue-50" : "border-gray-300"}
                                        ${error ? "border-red-500 bg-red-50" : ""}
                                        ${success ? "border-green-500 bg-green-50" : ""}
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                        disabled:bg-gray-100 disabled:cursor-not-allowed
                                        hover:border-blue-400`}
                                    aria-label={`Digit ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Timer & Resend */}
                    <div className="flex items-center justify-between text-sm pt-2">
                        <div className="flex items-center gap-2">
                            {timeLeft > 0 ? (
                                <>
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600 font-medium">
                                        OTP expires in {formatTime(timeLeft)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-red-600 font-semibold">OTP expired</span>
                            )}
                        </div>
                        <button
                            onClick={handleResend}
                            disabled={loading || timeLeft > 0}
                            className="text-blue-600 hover:text-blue-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed transition-colors underline-offset-2 hover:underline"
                        >
                            Resend OTP
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 animate-slideDown">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 animate-slideDown">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-green-700 font-semibold">Verification successful!</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end rounded-b-2xl">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleVerify}
                        disabled={loading || !isOtpComplete || timeLeft <= 0 || success}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying...
                            </span>
                        ) : (
                            "Verify & Switch Language"
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }
                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 200ms ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 200ms ease-out;
                }
                .animate-shake {
                    animation: shake 400ms ease-in-out;
                }
                .animate-slideDown {
                    animation: slideDown 300ms ease-out;
                }
            `}</style>
        </div>
    );
};

export default LanguageOTPModal;
