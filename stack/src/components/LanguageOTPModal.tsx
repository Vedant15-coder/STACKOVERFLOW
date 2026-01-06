import React, { useState, useEffect } from "react";
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
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    const languageNames: Record<string, string> = {
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError("Please enter a 6-digit OTP");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "/api/language/verify-otp",
                { otp },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                onVerified();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setError("");
        setOtp("");

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
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {t("language.verificationRequired")}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
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
                <div className="px-6 py-4 space-y-4">
                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            {t("language.switchingTo", { language: languageNames[targetLanguage] })}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            {t("language.otpSentTo", { channel })}
                        </p>
                    </div>

                    {/* OTP Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("language.enterOTP")}
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="000000"
                            disabled={loading || timeLeft <= 0}
                        />
                    </div>

                    {/* Timer */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                            {timeLeft > 0 ? (
                                <>Time remaining: {formatTime(timeLeft)}</>
                            ) : (
                                <span className="text-red-600">{t("language.otpExpired")}</span>
                            )}
                        </span>
                        <button
                            onClick={handleResend}
                            disabled={loading || timeLeft > 0}
                            className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {t("language.resendOTP")}
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end rounded-b-lg">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t("common.cancel")}
                    </button>
                    <button
                        onClick={handleVerify}
                        disabled={loading || otp.length !== 6 || timeLeft <= 0}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? t("common.loading") : t("language.verifyAndSwitch")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LanguageOTPModal;
