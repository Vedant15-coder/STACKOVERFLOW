import React, { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

interface LoginOTPModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (otp: string) => Promise<void>;
    email: string;
    loading?: boolean;
}

const LoginOTPModal: React.FC<LoginOTPModalProps> = ({
    isOpen,
    onClose,
    onVerify,
    email,
    loading = false,
}) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Timer countdown
    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(300);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    toast.error("OTP expired. Please request a new one.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    // Auto-focus first input on open
    useEffect(() => {
        if (isOpen && inputRefs.current[0]) {
            inputRefs.current[0]?.focus();
        }
    }, [isOpen]);

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
        setOtp(newOtp);

        // Focus last filled input or first empty
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async () => {
        const otpValue = otp.join("");
        if (otpValue.length !== 6) {
            toast.error("Please enter all 6 digits");
            return;
        }

        try {
            await onVerify(otpValue);
            setOtp(["", "", "", "", "", ""]);
        } catch (error) {
            // Error handled in parent
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">
                        🔐 Verify Your Login
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        We've sent a 6-digit code to
                        <br />
                        <span className="font-semibold text-gray-900">{maskedEmail}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* OTP Input */}
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                className="w-12 h-12 text-center text-xl font-semibold border-2 focus:border-blue-500"
                                disabled={loading || timeLeft === 0}
                            />
                        ))}
                    </div>

                    {/* Timer */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            {timeLeft > 0 ? (
                                <>
                                    Code expires in{" "}
                                    <span className="font-semibold text-blue-600">
                                        {formatTime(timeLeft)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-red-600 font-semibold">
                                    Code expired
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Verify Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || timeLeft === 0 || otp.some((d) => !d)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? "Verifying..." : "Verify & Login"}
                    </Button>

                    {/* Security Notice */}
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
                        <p className="text-xs text-amber-800">
                            <strong>⚠️ Security Notice:</strong> Never share this code with
                            anyone. DevQuery will never ask for this code via phone or chat.
                        </p>
                    </div>

                    {/* Device Info */}
                    <div className="text-center text-xs text-gray-500">
                        <p>
                            This verification is required for Chrome browser on desktop/laptop
                            for enhanced security.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LoginOTPModal;
