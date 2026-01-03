import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";

/**
 * Forgot Password Page
 * 
 * Allows users to reset their password by email
 * Rate limited to once per 24 hours
 * 
 * v1: Email only (phone number support can be added later)
 */

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!email || email.trim() === "") {
            toast.error("Email address is required");
            return;
        }

        setLoading(true);
        setSuccess(false);

        try {
            const response = await axiosInstance.post("/user/forgot-password", {
                email: email.trim(),
            });

            if (response.data.success) {
                setSuccess(true);
                toast.success(response.data.message);

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/auth");
                }, 3000);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to reset password. Please try again.";

            // Handle rate limit error (429)
            if (error.response?.status === 429) {
                toast.warning(errorMessage, { autoClose: 5000 });
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-6 lg:mb-8">
                    <Link href="/" className="flex items-center justify-center mb-4">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500 rounded mr-2 flex items-center justify-center">
                            <div className="w-4 h-4 lg:w-6 lg:h-6 bg-white rounded-sm flex items-center justify-center">
                                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-orange-500 rounded-sm"></div>
                            </div>
                        </div>
                        <span className="text-lg lg:text-xl font-bold text-gray-800">
                            stack<span className="font-normal">overflow</span>
                        </span>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-xl lg:text-2xl">
                            Forgot your password?
                        </CardTitle>
                        <CardDescription>
                            Enter your email address and we'll send you a new password
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {success ? (
                            // Success Message
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <svg
                                            className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <div>
                                            <h3 className="text-sm font-medium text-green-800">
                                                Password reset successful!
                                            </h3>
                                            <p className="text-sm text-green-700 mt-1">
                                                A new password has been sent to your registered email address.
                                                Please check your inbox.
                                            </p>
                                            <p className="text-xs text-green-600 mt-2">
                                                Redirecting to login page...
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => router.push("/auth")}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    Go to Login
                                </Button>
                            </div>
                        ) : (
                            // Form
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800">
                                        <strong>Note:</strong> You can request a password reset only once per 24 hours.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Reset Password"}
                                </Button>

                                <div className="text-center text-sm">
                                    <Link href="/auth" className="text-blue-600 hover:underline">
                                        ← Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
